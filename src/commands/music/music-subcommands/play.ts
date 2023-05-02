import prisma from "#utils/db.js";
import { secondsToTimestamp } from "#utils/utils.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import ytsr from "ytsr";
import { ModifiedInteraction } from "../music.js";
import { Video } from "ytsr";

export const data = new SlashCommandSubcommandBuilder()
    .setName("play")
    .setDescription("Plays the specified youtube video (audio only).")
    .addStringOption((option) =>
        option
            .setName("search")
            .setDescription("URL or search query for the youtube video.")
            .setRequired(true)
    );

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(interaction: ModifiedInteraction) {
    // Playlist? Video? Query?
    let unparsedSearch = interaction.options.getString("search") ?? "";

    // gets the content needed to play the video
    // Video used as a guide: https://www.youtube.com/watch?v=riyHsgI2IDs
    // Use ytdl ytsr ytpl
    // no longer using yts
    // ytdl.validateURL(unparsedSearch)

    const tag = interaction.user.tag;
    const nickname = interaction.member.nickname || interaction.user.username;
    const id = interaction.user.id;

    const tempQueue = [];

    if (unparsedSearch.startsWith("slot: ") && unparsedSearch.length === 7) {
        const slot = Number(unparsedSearch[6]);
        if (1 <= slot && slot <= 5) {
            const playlist = await prisma.playlist.findUnique({
                where: {
                    slot_userId: {
                        slot: slot,
                        userId: id,
                    },
                },
            });
            if (playlist.url.length !== 0) {
                unparsedSearch = playlist.url;
            }
        }
    }

    const isPlaylist = ytpl.validateID(unparsedSearch);
    const isUrl = ytdl.validateURL(unparsedSearch);
    if (isPlaylist) {
        const playlist = await ytpl(unparsedSearch);
        const videoInfos = playlist.items.map((item) => {
            const {
                title,
                shortUrl: url,
                author: { url: channelUrl, name: channel },
                bestThumbnail: { url: thumbnail },
                duration,
            } = item;
            return {
                title,
                url,
                thumbnail,
                duration,
                channel,
                channelUrl,
                nickname,
                tag,
            };
        });
        tempQueue.push(...videoInfos);
    } else if (isUrl) {
        const info = await ytdl.getBasicInfo(unparsedSearch);
        const thumbnails = info.videoDetails.thumbnails;

        const videoInfo = {
            title: info.videoDetails.title,
            url: info.videoDetails.video_url,
            thumbnail: thumbnails[thumbnails.length - 1].url,
            duration: secondsToTimestamp(
                Number(info.videoDetails.lengthSeconds)
            ),
            channel: info.videoDetails.ownerChannelName,
            channelUrl: info.videoDetails.ownerProfileUrl,
            nickname,
            tag,
        };

        tempQueue.push(videoInfo);
    } else {
        const searchURL = (await ytsr.getFilters(unparsedSearch))
            .get("Type")
            .get("Video").url;
        if (!searchURL) {
            console.log(unparsedSearch);
            await interaction.editReply("The video could not be found.");
            return;
        }
        const searchResults = await ytsr(searchURL, {
            limit: 1,
        });
        if (searchResults.items.length <= 0) {
            await interaction.editReply("The video could not be found.");
            return;
        }
        const {
            title,
            url,
            bestThumbnail: { url: thumbnail },
            author: { url: channelUrl, name: channel },
            duration,
        } = searchResults.items[0] as Video;
        const videoInfo = {
            title,
            url,
            thumbnail,
            duration,
            channel,
            channelUrl,
            nickname,
            tag,
        };
        tempQueue.push(videoInfo);
    }

    if (tempQueue.length > 1)
        await interaction.editReply(
            `Added ${tempQueue.length} songs to the queue.`
        );
    else
        await interaction.editReply(
            `Added "${tempQueue[0].title}" to the queue.`
        );

    if (!interaction.queue) return tempQueue;

    interaction.queue.songs.push(...tempQueue);
}
