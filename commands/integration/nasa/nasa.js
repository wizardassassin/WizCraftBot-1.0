import { SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { Collection } from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const data = new SlashCommandSubcommandGroupBuilder()
    .setName("nasa")
    .setDescription("NASA integration.");

const subcommands = new Collection();

const subcommandFiles = fs
    .readdirSync(dirname(fileURLToPath(import.meta.url)) + "/subcommands")
    .filter((file) => file.endsWith(".js"));

for (const subcommandFile of subcommandFiles) {
    const subcommand = await import(`./subcommands/${subcommandFile}`);
    subcommands.set(subcommand.data.name, subcommand);
    data.addSubcommand(subcommand.data);
}

export { data };

export async function execute(interaction) {
    const subcommandName = interaction.options.getSubcommand();
    const subcommand = subcommands.get(subcommandName);

    if (!subcommand) return;

    try {
        subcommand.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this API!",
            ephemeral: true,
        });
    }
}
