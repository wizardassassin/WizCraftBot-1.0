import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("credits")
    .setDescription("Shows Credits!");
export async function execute(interaction) {
    await interaction.reply("Boop!");
}
