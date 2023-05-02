import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("beep")
    .setDescription("Replies with Boop!");
export async function execute(
    interaction: import("discord.js").ChatInputCommandInteraction
) {
    await interaction.reply("Boop!");
}
