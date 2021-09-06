// Deploys slash commands to a server for ease of testing
import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
const clientId = process.env.CLIENT_ID_WIZCRAFTBOT_V1;
const guildId = process.env.GUILD_ID_WIZCRAFTBOT_V1;
const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

const commands = [];
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
    });

    console.log("Successfully registered application commands.");
} catch (error) {
    console.error(error);
}
