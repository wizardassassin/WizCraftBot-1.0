import { SlashCommandSubcommandBuilder } from "discord.js";
import { ModifiedInteraction } from "../music.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Removes the song at the specified position.")
    .addIntegerOption((option) =>
        option
            .setName("position")
            .setDescription("The position of the song in the queue.")
            .setRequired(true)
    );

export async function execute(interaction: ModifiedInteraction) {
    const { queue } = interaction;
    const { songs, player } = queue;
    const songLength = songs.length;
    const index = interaction.options.getInteger("position");
    if (index < 0 || index > songLength - 1) {
        await interaction.editReply("That position does not exist.");
        return;
    }
    if (index === 0) {
        interaction.queue.forceSkip = true;
        player.stop();
        await interaction.editReply(`Removed "${songs[0].title}"`);
        return;
    }
    const removed = songs.splice(index, 1);
    await interaction.editReply(`Removed "${removed[0].title}"`);
}
