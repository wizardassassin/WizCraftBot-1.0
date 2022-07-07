import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("queue")
    .setDescription("Replies with the current server queue.");
/**
 *
 * @param {CommandInteraction} interaction
 */
export async function execute(interaction) {
    /**@type {Array}*/
    const { queue } = interaction;
    const songs = queue.songs;
    const currentSong = songs[0];
    const nextSongs = songs.slice(1, 6);
    const nextSongs2 = songs.slice(6, 11);
    const embed = new MessageEmbed()
        .setTitle("Queue for " + interaction.guild.name)
        .addField(
            "Now Playing:",
            `[${currentSong.title}](${currentSong.url}) | \`${currentSong.duration} Requested by: ${currentSong.nickname} (${currentSong.tag})\``
        )
        .setTimestamp()
        .setFooter({ text: "Have a nice day!" });

    if (nextSongs.length) {
        embed.addField(
            "Up Next:",
            nextSongs
                .reduce(
                    (acc, cur, i) =>
                        acc +
                        `\`${i + 1}.\` [${cur.title}](${cur.url}) | \`${
                            cur.duration
                        } Requested by: ${cur.nickname} (${cur.tag})\`\n\n`,
                    ""
                )
                .trim(),
            false
        );
        if (nextSongs2.length) {
            embed.addField(
                "\u200B",
                nextSongs2
                    .reduce(
                        (acc, cur, i) =>
                            acc +
                            `\`${i + 6}.\` [${cur.title}](${cur.url}) | \`${
                                cur.duration
                            } Requested by: ${cur.nickname} (${cur.tag})\`\n\n`,
                        ""
                    )
                    .trim(),
                false
            );
        }
    }
    embed.addField(
        "Settings:",
        `\`repeatSong:\` **${queue.repeatSong}**\n\`loopQueue:\` **${queue.loopQueue}**`
    );

    await interaction.editReply({ embeds: [embed] });
}
