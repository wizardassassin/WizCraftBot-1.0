import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { ModifiedInteraction } from "../music.js";
import { secondsToTimestamp } from "#utils/utils.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("status")
    .setDescription("Gets the status of the currently playing song.");

export async function execute(interaction: ModifiedInteraction) {
    const currentSong = interaction.queue.songs[0];
    const totalDuration = currentSong.duration as number;
    const playbackDuration = secondsToTimestamp(
        Math.floor(interaction.queue.resource.playbackDuration / 1000)
    );
    const timestamp = `${playbackDuration}/${totalDuration}`;

    const embed = new EmbedBuilder()
        .setTitle("Song Status")
        .addFields(
            {
                name: "Now Playing",
                value: `[${currentSong.title}](${currentSong.url})`,
            },
            {
                name: "Playback Status",
                value: `\`${timestamp}\``,
            },
            {
                name: "Requested By",
                value: `${currentSong.displayName}`,
            }
        )
        .setTimestamp()
        .setFooter({
            text: "Have a nice day!",
        });

    await interaction.editReply({
        embeds: [embed],
    });
}
