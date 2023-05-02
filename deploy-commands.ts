// Deploys slash commands to a server for ease of testing
import fs from "fs";
import { REST } from "@discordjs/rest";
import { APIApplicationCommandSubcommandOption, Routes } from "discord.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const clientId = process.env.CLIENT_ID_WIZCRAFTBOT_V1;
const guildId = process.env.GUILD_ID_WIZCRAFTBOT_V1;
const token = process.env.DISCORD_BOT_WIZCRAFTBOT_V1;

const cwd = dirname(fileURLToPath(import.meta.url));

const commands = [];
const commandsFolders = fs
    .readdirSync(cwd + "/commands")
    .filter((folder) => fs.lstatSync(`./commands/${folder}`).isDirectory());
for (const folder of commandsFolders) {
    const commandFiles = fs
        .readdirSync(cwd + `/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = await import(`./commands/${folder}/${file}`);
        command.data.setDMPermission(false); // Hotfix
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: "10" }).setToken(token);

try {
    console.log(
        `Started refreshing ${commands.length} application (/) commands.`
    );

    const route =
        process.env.NODE_ENV === "production"
            ? Routes.applicationCommands(clientId)
            : Routes.applicationGuildCommands(clientId, guildId);

    const data = (await rest.put(route, {
        body: commands,
    })) as Array<APIApplicationCommandSubcommandOption>;

    // console.log("Successfully registered application commands.");
    console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
    );
} catch (error) {
    console.error(error);
}
