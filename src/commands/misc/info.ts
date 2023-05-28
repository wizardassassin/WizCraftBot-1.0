import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Information about this discord bot.");
export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(
        "An all round discord bot dedicated to fun and minecraft."
    );
}
