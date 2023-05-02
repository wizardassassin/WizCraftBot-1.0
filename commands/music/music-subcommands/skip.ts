import { SlashCommandSubcommandBuilder } from "discord.js";
import { AudioPlayer } from "@discordjs/voice";
import { ModifiedInteraction } from "../music.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("skip")
    .setDescription(
        "Skips the currently playing song(if there is a song to skip)."
    )
    .addBooleanOption((option) =>
        option
            .setName("force")
            .setDescription("Ignore repeatSong and loopQueue.")
    );

export async function execute(interaction: ModifiedInteraction) {
    // /**@type {AudioPlayer} */
    const player = interaction.queue.player;
    const forceSkip = interaction.options.getBoolean("force") ?? false;
    if (forceSkip) {
        interaction.queue.forceSkip = true;
    }
    player.stop();
    await interaction.editReply(
        `Skipped "${interaction.queue.songs[0].title}"`
    );
}
