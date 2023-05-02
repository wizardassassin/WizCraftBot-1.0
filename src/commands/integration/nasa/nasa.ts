import { Collection, SlashCommandSubcommandGroupBuilder } from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { SubcommandModule } from "types/common/discord.js";
import { fileURLToPath } from "url";

const data = new SlashCommandSubcommandGroupBuilder()
    .setName("nasa")
    .setDescription("NASA integration.");

const subcommands = new Collection<string, SubcommandModule>();

const subcommandFiles = fs
    .readdirSync(dirname(fileURLToPath(import.meta.url)) + "/subcommands")
    .filter((file) => file.endsWith(".js"));

for (const subcommandFile of subcommandFiles) {
    const subcommand = await import(`./subcommands/${subcommandFile}`);
    subcommands.set(subcommand.data.name, subcommand);
    data.addSubcommand(subcommand.data);
}

export { data };

export async function execute(
    interaction: import("discord.js").ChatInputCommandInteraction
) {
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
