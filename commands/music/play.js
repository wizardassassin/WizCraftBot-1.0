import { SlashCommandBuilder } from "@discordjs/builders";
import { Permissions, Collection, Formatters, Util } from "discord.js";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import ytsr from "ytsr";
import {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";

const queue = new Collection();

const tempQueue = [];

export const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays the specified youtube video (audio only).")
    .addStringOption((option) =>
        option
            .setName("search")
            .setDescription("URL or search query for the youtube video.")
            .setRequired(true)
    );
export async function execute(interaction) {
    if (
        !interaction.member.permissions.has(Permissions.FLAGS.CONNECT) ||
        !interaction.member.permissions.has(Permissions.FLAGS.SPEAK)
    ) {
        // If they don't have the required permissions
        await interaction.reply("You do not have the required permissions.");
        return;
    }

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
        await interaction.reply("You need to be in a voice channel.");
        return;
    }

    // Playlist? Video? Query?
    const unparsedSearch = interaction.options.getString("search");

    const songInfo = { title: "", url: "", thumbnail: "", duration: "" };

    // gets the content needed to play the video
    // Video used as a guide: https://www.youtube.com/watch?v=riyHsgI2IDs
    // Use ytdl ytsr ytpl
    // no longer using yts
    // ytdl.validateURL(unparsedSearch)

    let guildQueue;

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
            };
        });
        tempQueue.push(...videoInfos);
    } else {
        const isUrl = ytdl.validateURL(unparsedSearch);
        const searchResults = await ytsr(
            isUrl
                ? unparsedSearch
                : (await ytsr.getFilters(unparsedSearch))
                      .get("Type")
                      .get("Video").url,
            {
                limit: 1,
            }
        );
        if (searchResults.items.length <= 0) {
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
        };
        tempQueue.push(videoInfo);
    }

    // const reply = Util.splitMessage(JSON.stringify(tempQueue, null, 4), {
    //     maxLength: 1985,
    // }).map((message) => Formatters.codeBlock("json", message));

    // await interaction.reply(reply.shift());
    // reply.forEach(async (message) => await interaction.followUp(message));
    // return;
    //
    const { guild } = interaction;
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
    });

    const maxAudioBitrate = voiceChannel.bitrate / 1000; // kps

    // ECONNRESET ??
    // AudioOnly files are not playing friendly
    const formatOptions = {
        filter: (format) => {
            if (format.hasAudio && format.audioBitrate <= maxAudioBitrate) {
                console.log(format.audioBitrate, format.hasVideo);
                return true;
            }
            return false;
        },
        quality: "highestaudio",
        highWaterMark: 1 << 21, // solution?
        dlChunkSize: 1 << 26, // solution?
    };

    const stream = ytdl(tempQueue[0].url, formatOptions);
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        // inlineVolume: true,
    });
    // console.log(resource.volume.volume);
    // resource.volume.setVolume(1);
    // console.log(resource.volume.volume);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());

    const trim = (str, max) =>
        str.length > max ? `${str.slice(0, max - 3)}...` : str;

    await interaction.reply(
        "```json\n" + trim(JSON.stringify(tempQueue, null, 4), 1989) + "```"
    );
}
