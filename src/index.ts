/**
 * Relearning on how to create a discord bot
 * I can use slash commands now yay
 * Following: https://discordjs.guide/
 */
// import "./deploy-commands.js"; // dev
import fs from "fs";
import {
    ActivityType,
    Client,
    Collection,
    IntentsBitField,
    PresenceData,
} from "discord.js";
import { PrismaClient } from "@prisma/client";
import { addExitEvent, importExitHandler } from "./utils/setup.js";
import * as dotenv from "dotenv";
import { CommandModule } from "types/common/discord.js";
import { CronScheduler } from "#utils/cronScheduler.js";
import { addCronJobs } from "#utils/cronJobs.js";

dotenv.config();

importExitHandler();

const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

const clientIntents = new IntentsBitField();
clientIntents.add(
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildPresences
);

const clientPresence = {
    activities: [{ name: "Minecraft", type: ActivityType.Competing }],
    status: "online",
} as PresenceData;

const client = new Client({
    intents: clientIntents,
    presence: clientPresence,
});

// Imports database
const prisma = new PrismaClient();
client.prisma = prisma;

// Imports commands
client.commands = new Collection<string, CommandModule>();

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
client.componentCollectors = new Collection<string, string>();

client.storage = new Collection();

client.storage.set("presence", clientPresence);

client.cronScheduler = new CronScheduler(client);

addCronJobs(client.cronScheduler);

addExitEvent(() => client.cronScheduler.stop());

client.login(token);
