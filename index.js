/**
 * Relearning on how to create a discord bot
 * I can use slash commands now yay
 * Following: https://discordjs.guide/
 */
// import "./deploy-commands.js"; // dev
import "dotenv/config";
import fs from "fs";
import { Client, Collection, IntentsBitField } from "discord.js";
import prisma from "#utils/db";

const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

const clientIntents = new IntentsBitField();
clientIntents.add(
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.Guilds
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
