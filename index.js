/*
Relearning on how to create a discord bot
I can use slash commands now yay
Following: https://discordjs.guide/
*/
// import "./deploy-commands.js"; // dev
import fs from "fs";
import { Client, Collection, Intents } from "discord.js";
const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

// Spent a couple hours debugging .AwaitMessages()
// and cached voice states,
// not realizing that I needed to add intents
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});

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

client.login(token);
