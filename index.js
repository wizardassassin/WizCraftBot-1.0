/*
Relearning on how to create a discord bot
I can use slash commands now yay
Following: https://discordjs.guide/
*/
import fs from "fs";
import { Client, Collection, Intents } from "discord.js";
const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

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
