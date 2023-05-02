import { SlashCommandBuilder } from "discord.js";
import { execute as presenceExecute } from "./subcommands/presence.js";

export const data = new SlashCommandBuilder()
    .setName("played")
    .setDescription("Alias for /privileged presence.")
    .addUserOption((option) =>
        option.setName("user").setDescription("User to get information about.")
    );

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(
    interaction: import("discord.js").ChatInputCommandInteraction
) {
    await interaction.deferReply();
    await presenceExecute(interaction);
}
