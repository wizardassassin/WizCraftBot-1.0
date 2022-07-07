import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import ytsr from "ytsr";

export const data = new SlashCommandSubcommandBuilder()
    .setName("play")
    .setDescription("Plays the specified youtube video (audio only).")
    .addStringOption((option) =>
        option
            .setName("search")
            .setDescription("URL or search query for the youtube video.")
            .setRequired(true)
    );
export async function execute(interaction) {
    // Playlist? Video? Query?
    const unparsedSearch = interaction.options.getString("search");

    // gets the content needed to play the video
    // Video used as a guide: https://www.youtube.com/watch?v=riyHsgI2IDs
    // Use ytdl ytsr ytpl
    // no longer using yts
    // ytdl.validateURL(unparsedSearch)

    const tag = interaction.user.tag;
    const nickname = interaction.member.nickname || interaction.user.username;

    const tempQueue = [];

    const isPlaylist = ytpl.validateID(unparsedSearch);
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
    } else {
        const isUrl = ytdl.validateURL(unparsedSearch);
        const searchResults = await ytsr(
            isUrl
                ? ytdl.getVideoID(unparsedSearch)
                : (await ytsr.getFilters(unparsedSearch))
                      .get("Type")
                      .get("Video").url,
            {
                limit: 1,
            }
        );
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
        } = searchResults.items[0];
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
