// Deploys slash commands to a server for ease of testing
import fs from "fs";
import "dotenv/config";
import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";
const clientId = process.env.CLIENT_ID_WIZCRAFTBOT_V1;
const guildId = process.env.GUILD_ID_WIZCRAFTBOT_V1;
const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

const commands = [];
const commandsFolders = fs
    .readdirSync("./commands")
    .filter((folder) => fs.lstatSync(`./commands/${folder}`).isDirectory());
for (const folder of commandsFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = await import(`./commands/${folder}/${file}`);
        command.data.setDMPermission(false); // Hotfix
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: "10" }).setToken(token);

try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
        // Routes.applicationGuildCommands(clientId, guildId),
        Routes.applicationCommands(clientId),
        {
            body: commands,
        }
    );

    // console.log("Successfully registered application commands.");
    console.log("Successfully reloaded application (/) commands.");
} catch (error) {
    console.error(error);
}
