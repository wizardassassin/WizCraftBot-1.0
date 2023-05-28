import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { ModifiedInteraction } from "../music.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("current")
    .setDescription("Gets info about the current song.");

export async function execute(interaction: ModifiedInteraction) {
    const { queue } = interaction;
    const { resource, player, songs } = queue;
    const embed = new EmbedBuilder()
        .setTitle("Playing")
        .setFields(
            { name: "Now Playing:", value: songs[0].title },
            {
                name: "Duration:",
                value: String(resource.playbackDuration) + " ms",
            }
        )
        .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
}
