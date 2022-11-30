/**
 * Relearning on how to create a discord bot
 * I can use slash commands now yay
 * Following: https://discordjs.guide/
 */
// import "./deploy-commands.js"; // dev
import fs from "fs";
import { Client, Collection, IntentsBitField } from "discord.js";
import prisma from "#utils/db";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

const clientIntents = new IntentsBitField();
clientIntents.add(
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildPresences
);

const client = new Client({
    intents: clientIntents,
});

// Imports database
client.db = prisma;

// Imports commands
client.commands = new Collection();

const commandsFolders = fs
    .readdirSync("./commands")
    .filter((folder) => fs.lstatSync(`./commands/${folder}`).isDirectory());

for (const folder of commandsFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = await import(`./commands/${folder}/${file}`);

        client.commands.set(command.data.name, command);
    }
}

// Imports events
const eventFiles = fs
    .readdirSync("./events")
    .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = await import(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Adds Important Info
client.componentCollectors = new Collection();

client.login(token);

let pushedOnce = false;

function handleUserExit(signal) {
    console.log({ Received: signal });
    if (pushedOnce) {
        console.log("Forcefully shutting down...");
        process.exit(1);
    }
    pushedOnce = true;
    console.log("Received Ctrl+C, gracefully shutting down...");
    console.log("Press Ctrl+C again to forcefully shutdown.");
    prisma.$disconnect().then(() => process.exit(0));
}

process.on("SIGINT", (code) => {
    handleUserExit(code);
});
process.on("SIGTERM", (code) => {
    handleUserExit(code);
});

setInterval(async () => {
    console.log("Started Presence Collection");
    const users = await prisma.user.findMany({
        where: {
            isEnabled: {
                equals: true,
            },
        },
    });
    const userPresences = new Collection();

    for (const user of users) {
        if (!userPresences.has(user.guildId)) {
            userPresences.set(user.guildId, new Set());
        }
        userPresences.get(user.guildId).add(user.id);
    }
    for (const [guildId, userIds] of userPresences) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log("Can't find guild", guildId);
            continue;
        }
        for (const userId of userIds) {
            const presence = guild.members?.cache.get(userId)?.presence;
            if (!presence) {
                console.log("Can't find presence", userId);
                continue;
            }
            await storePresence(presence);
        }
    }
    await prisma.presence.deleteMany({
        where: {
            updatedAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 1),
            },
        },
    });
}, 60000);

async function storePresence(presence) {
    const activities = presence.activities
        .map((x) => ({
            name: x.name,
            state: x.state,
            details: x.details,
            applicationId: x.applicationId,
            timestamps: x.timestamps,
            smallImageUrl: x.assets?.smallImageURL(),
            largeImageUrl: x.assets?.largeImageURL(),
        }))
        .filter((x) => x.applicationId);
    const id = presence.userId;
    // console.log(presence.activities);
    for (const activity of activities) {
        await prisma.presence.upsert({
            where: {
                userId_applicationId_createdAt: {
                    userId: id,
                    applicationId: activity.applicationId,
                    createdAt: activity.timestamps.start,
                },
            },
            update: {
                name: activity.name,
                state: activity.state,
                details: activity.details,
                smallImageUrl: activity.smallImageURL,
                largeImageUrl: activity.largeImageURL,
            },
            create: {
                name: activity.name,
                state: activity.state,
                details: activity.details,
                createdAt: activity.timestamps.start,
                smallImageUrl: activity.smallImageURL,
                largeImageUrl: activity.largeImageURL,
                applicationId: activity.applicationId,
                User: {
                    connect: {
                        id: id,
                    },
                },
            },
        });
    }
}
