import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { ModifiedInteraction } from "../music.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("queue")
    .setDescription("Replies with the current server queue.");

export async function execute(interaction: ModifiedInteraction) {
    // /**@type {Array}*/
    const { queue } = interaction;
    const songs = queue.songs;

    let startIndex = 0;

    const embed = createEmbed(interaction, songs, queue, startIndex);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("Prev Page")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("◀️"),
        new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next Page")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("▶️")
    );

    const reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
    });

    interaction.client.componentCollectors.set(reply.id, null);

    const collector = interaction.channel.createMessageComponentCollector({
        filter: (i) => i.message.id === reply.id,
        idle: 60000,
    });

    collector.on("collect", async (i) => {
        if (i.customId === "prev") {
            if (startIndex - 5 < 0) {
                i.reply({
                    content: "Invalid Page.",
                    ephemeral: true,
                });
                return;
            }
            startIndex -= 5;
            const newEmbed = createEmbed(interaction, songs, queue, startIndex);
            await i.update({ embeds: [newEmbed] });
            return;
        }
        if (i.customId === "next") {
            if (startIndex + 5 + 1 + 5 >= songs.length) {
                i.reply({
                    content: "Invalid Page.",
                    ephemeral: true,
                });
                return;
            }
            startIndex += 5;
            const newEmbed = createEmbed(interaction, songs, queue, startIndex);
            await i.update({ embeds: [newEmbed] });
            return;
        }
    });

    collector.on("end", (collected) => {
        console.log(`Collected ${collected.size} items`);
        interaction.client.componentCollectors.delete(reply.id);
    });
}

function createEmbed(
    interaction: ModifiedInteraction,
    songs: ModifiedInteraction["queue"]["songs"],
    queue: ModifiedInteraction["queue"],
    start: number
) {
    const startIndex = start + 1;
    const endIndex1 = startIndex + 5;
    const endIndex2 = endIndex1 + 5;
    const currentSong = songs[0];
    const nextSongs = songs.slice(startIndex, endIndex1);
    const nextSongs2 = songs.slice(endIndex1, endIndex2);
    const page1 = start / 5 + Math.sign(nextSongs.length);
    const page2 = page1 + Math.sign(nextSongs2.length);
    const pages = Math.ceil((songs.length - 1) / 5);
    const embed = new EmbedBuilder()
        .setTitle("Queue for " + interaction.guild.name)
        .addFields({
            name: "Now Playing:",
            value: `[${currentSong.title}](${currentSong.url}) | \`${currentSong.duration} Requested by: ${currentSong.nickname} (${currentSong.tag})\``,
        })
        .setTimestamp()
        .setFooter({
            text: `Page ${page1}-${page2}/${pages}  •  Have a nice day!`,
        });

    if (nextSongs.length) {
        embed.addFields({
            name: "Up Next:",
            value: nextSongs
                .reduce(
                    (acc, cur, i) =>
                        acc +
                        `\`${i + startIndex}.\` [${cur.title}](${
                            cur.url
                        }) | \`${cur.duration} Requested by: ${cur.nickname} (${
                            cur.tag
                        })\`\n\n`,
                    ""
                )
                .trim(),
            inline: true,
        });
        if (nextSongs2.length) {
            embed.addFields({
                name: "Up Next:",
                value: nextSongs2
                    .reduce(
                        (acc, cur, i) =>
                            acc +
                            `\`${i + endIndex1}.\` [${cur.title}](${
                                cur.url
                            }) | \`${cur.duration} Requested by: ${
                                cur.nickname
                            } (${cur.tag})\`\n\n`,
                        ""
                    )
                    .trim(),
                inline: true,
            });
        }
    }
    embed.addFields({
        name: "Settings:",
        value: `\`repeatSong:\` **${queue.repeatSong}**\n\`loopQueue:\` **${queue.loopQueue}**`,
    });
    return embed;
}
