import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
    userMention,
} from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("queue")
    .setDescription("Replies with the current server queue.");
/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
    /**@type {Array}*/
    const { queue } = interaction;
    const songs = queue.songs;
    const currentSong = songs[0];
    const nextSongs = songs.slice(1, 6);
    const nextSongs2 = songs.slice(6, 11);
    const embed = new EmbedBuilder()
        .setTitle("Queue for " + interaction.guild.name)
        .addFields({
            name: "Now Playing:",
            value: `[${currentSong.title}](${currentSong.url}) | \`${currentSong.duration} Requested by: ${currentSong.nickname} (${currentSong.tag})\``,
        })
        .setTimestamp()
        .setFooter({ text: `Page ${2.72}/${3.14}  •  Have a nice day!` });

    if (nextSongs.length) {
        embed.addFields({
            name: "Up Next:",
            value: nextSongs
                .reduce(
                    (acc, cur, i) =>
                        acc +
                        `\`${i + 1}.\` [${cur.title}](${cur.url}) | \`${
                            cur.duration
                        } Requested by: ${cur.nickname} (${cur.tag})\`\n\n`,
                    ""
                )
                .trim(),
            inline: false,
        });
        if (nextSongs2.length) {
            embed.addFields({
                name: "\u200B",
                value: nextSongs2
                    .reduce(
                        (acc, cur, i) =>
                            acc +
                            `\`${i + 6}.\` [${cur.title}](${cur.url}) | \`${
                                cur.duration
                            } Requested by: ${cur.nickname} (${cur.tag})\`\n\n`,
                        ""
                    )
                    .trim(),
                inline: false,
            });
        }
    }
    embed.addFields({
        name: "Settings:",
        value: `\`repeatSong:\` **${queue.repeatSong}**\n\`loopQueue:\` **${queue.loopQueue}**`,
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("Prev Page")
            .setStyle(ButtonStyle.Success)
            .setEmoji("◀️"),
        new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next Page")
            .setStyle(ButtonStyle.Success)
            .setEmoji("▶️")
    );

    const reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
    });

    interaction.client.componentCollectors.set(reply.id, null);

    const filter = (i) => i.message.id === reply.id;

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        idle: 60000,
    });

    collector.on("collect", async (i) => {
        await i.reply({
            content: `Tell ${userMention(
                process.env.DISCORD_DEV_USER_ID
            )} to stop being lazy!`,
            ephemeral: true,
        });
    });

    collector.on("end", (collected) => {
        console.log(`Collected ${collected.size} items`);
        interaction.client.componentCollectors.delete(reply.id);
    });
}
