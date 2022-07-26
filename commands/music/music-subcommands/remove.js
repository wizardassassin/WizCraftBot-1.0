import { SlashCommandSubcommandBuilder } from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Removes the song at the specified position.")
    .addIntegerOption((option) =>
        option
            .setName("position")
            .setDescription("The position of the song in the queue.")
            .setRequired(true)
    );
/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    const { queue } = interaction;
    const { songs, player } = queue;
    const songLength = songs.length;
    const index = interaction.options.getInteger("position");
    if (index < 0 || index > songLength - 1) {
        await interaction.editReply("That position does not exist.");
        return;
    }
    if (index == 0) {
        player.stop();
    }
    const removed = songs.splice(index, 1);
    await interaction.editReply(`Removed "${removed[0].title}"`);
}
