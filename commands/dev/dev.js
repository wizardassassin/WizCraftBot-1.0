import { Collection, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const data = new SlashCommandBuilder()
    .setName("dev")
    .setDescription("Dev/test commands.");

const subcommands = new Collection();

const subcommandFiles = fs
    .readdirSync(dirname(fileURLToPath(import.meta.url)) + "/subcommands")
    .filter((file) => file.endsWith(".js"));

for (const subcommandFile of subcommandFiles) {
    const subcommand = await import(`./subcommands/${subcommandFile}`);
    subcommands.set(subcommand.data.name, subcommand);
    data.addSubcommand(subcommand.data);
}

const authUsers = new Set();
authUsers.add(process.env.DISCORD_DEV_USER_ID);
const useAuth = false;

export { data };

export async function execute(interaction) {
    const subcommandName = interaction.options.getSubcommand();
    const subcommand = subcommands.get(subcommandName);

    if (!subcommand) return;

    if (useAuth && !authUsers.has(interaction.user.id)) return;

    try {
        subcommand.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
}
