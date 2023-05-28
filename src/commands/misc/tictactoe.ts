import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

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
            .addChoices(
                { name: "easy", value: "easy" },
                { name: "medium", value: "medium" },
                { name: "impossible", value: "impossible" }
            )
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    const opponent = interaction.options.getUser("opponent") || ""; // Should I really call the user object for the bot?
    const difficulty = interaction.options.getString("difficulty") || "medium";
    if (!opponent || opponent.bot) {
        // If the opponent doesn't exist or is a bot
        // Defaults to the bot
    }
    await interaction.reply("reply");
}
