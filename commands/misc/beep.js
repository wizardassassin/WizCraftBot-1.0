import { SlashCommandBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
    .setName("beep")
    .setDescription("Replies with Boop!");
export async function execute(interaction) {
    await interaction.reply("Boop!");
}
