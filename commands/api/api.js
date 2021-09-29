import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection } from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const data = new SlashCommandBuilder()
    .setName("api")
    .setDescription("Makes a call to an API.");

const apis = new Collection();

// Imports api subcommands
const apiFiles = fs
    .readdirSync(dirname(fileURLToPath(import.meta.url)) + "/api-subcommands") // Why can't ."/" be universal? // relates to the directory the program was called on
    .filter((file) => file.endsWith(".js"));

for (const file of apiFiles) {
    const api = await import(`./api-subcommands/${file}`); // Why can't ."/" be universal? // relates to the directory the file is in
    apis.set(api.data.name, api);
    data.addSubcommand(api.data); // Revelation!! You can just pass in a SlashCommandSubcommandBuilder instead of a function
}

export { data };
export async function execute(interaction) {
    const apiCommandName = interaction.options.getSubcommand();
    const apiCommand = apis.get(apiCommandName);

    if (!apiCommand) return;

    try {
        apiCommand.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this API!",
            ephemeral: true,
        });
    }
}
