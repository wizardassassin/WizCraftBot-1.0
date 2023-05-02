/**
 * Relearning on how to create a discord bot
 * I can use slash commands now yay
 * Following: https://discordjs.guide/
 */
// import "./deploy-commands.js"; // dev
import fs from "fs";
import { Client, Collection, IntentsBitField } from "discord.js";
import prisma from "./utils/db.js";
import { importExitHandler } from "./utils/setup.js";
import {
    customCollectors,
    importCustomCollectors,
} from "./utils/collectors.js";
import * as dotenv from "dotenv";
import { CommandModule } from "types/common/discord.js";

dotenv.config();

importExitHandler();

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

importCustomCollectors(client);
client.customCollectors = customCollectors;

client.login(token);
