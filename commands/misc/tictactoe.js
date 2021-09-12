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
    const opponent = interaction.options.getUser("opponent") || ""; // Should I really call the user object for the bot?
    const difficulty = interaction.options.getString("difficulty") || "medium";
    if (!opponent || opponent.bot) {
        // If the opponent doesn't exist or is a bot
        // Defaults to the bot
        
    }
    await interaction.reply("reply");
}
