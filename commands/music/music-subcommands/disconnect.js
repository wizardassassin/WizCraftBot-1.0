import { SlashCommandSubcommandBuilder } from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnects the music player.");
/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    const { queue } = interaction;
    const { songs, player } = queue;
    // Hacky solution
    songs.length = 0;
    queue.forceSkip = true;
    player.stop();
    await interaction.editReply(`Done.`);
}
