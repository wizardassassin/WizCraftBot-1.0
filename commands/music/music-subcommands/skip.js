import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { AudioPlayer } from "@discordjs/voice";

export const data = new SlashCommandSubcommandBuilder()
    .setName("skip")
    .setDescription(
        "Skips the currently playing song(if there is a song to skip)."
    );
export async function execute(interaction) {
    /**@type {AudioPlayer} */
    const player = interaction.queue.player;
    player.stop();
    await interaction.reply(`Skipped "${interaction.queue.songs[0].title}"`);
}
