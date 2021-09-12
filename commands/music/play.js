import { SlashCommandBuilder } from "@discordjs/builders";
import { Permissions, Collection } from "discord.js";
import ytdl from "ytdl-core";
import ytSearch from "yt-search";
import {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";

const queue = new Collection();

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

    const unparsedSearch = interaction.options.getString("search");

    const songInfo = { title: "", url: "", thumbnail: "", duration: "" };

    if (ytdl.validateURL(unparsedSearch)) {
        // If the search is a youtube video URL
        const video = await ytdl.getInfo(unparsedSearch);
        const seconds = video.videoDetails.lengthSeconds;
        const url = new URL(video.videoDetails.thumbnails[0].url);
        songInfo.title = url.origin + url.pathname;
        songInfo.thumbnail = video.videoDetails.title;
        songInfo.url = video.videoDetails.video_url;
        songInfo.duration =
            seconds < 3600
                ? new Date(seconds * 1000).toISOString().substr(14, 5)
                : new Date(seconds * 1000).toISOString().substr(11, 8);
    } else {
        // If it isn't, treat the string as a query
        const videoResults = await ytSearch(unparsedSearch);
        const video = videoResults.videos[0];
        if (!video) {
            // If the video is not found even with searching
            await interaction.reply("The video could not be found.");
            return;
        }
        songInfo.title = video.title;
        songInfo.url = video.url;
        songInfo.thumbnail = video.thumbnail;
        songInfo.duration = video.timestamp;
    }
    console.log(songInfo);
    //
    const { guild } = interaction;
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
    });

    const stream = ytdl(songInfo.url, { filter: "audioonly" });
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
    //
    await interaction.reply(
        "```json\n" + JSON.stringify(songInfo, null, 4) + "```"
    );
}
