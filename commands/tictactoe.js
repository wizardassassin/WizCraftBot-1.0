import { SlashCommandBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("description")
    .addUserOption((option) =>
        option
            .setName("opponent")
            .setDescription("Your tic tac toe opponent(Defaults to the bot).")
    )
    .addStringOption((option) =>
        option
            .setName("difficulty")
            .setDescription("Difficulty of the arena(Defaults to medium).")
            .addChoice("easy", "easy")
            .addChoice("medium", "medium")
            .addChoice("impossible", "impossible")
    );
export async function execute(interaction) {
    await interaction.reply("reply");
}
