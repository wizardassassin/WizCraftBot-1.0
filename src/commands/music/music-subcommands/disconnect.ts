import { SlashCommandSubcommandBuilder } from "discord.js";
import { ModifiedInteraction } from "../music.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnects the music player.");

export async function execute(interaction: ModifiedInteraction) {
    const { queue } = interaction;
    const { songs, player } = queue;
    // Hacky solution
    songs.length = 0;
    queue.forceSkip = true;
    player.stop(true);
    await interaction.editReply(`Done.`);
}
