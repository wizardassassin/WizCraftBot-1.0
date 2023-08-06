import {
    ChatInputCommandInteraction,
    Collection,
    GuildMember,
    PermissionsBitField,
    SlashCommandBuilder,
} from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
// import ytdl from "ytdl-core";
import ytdl from "@distube/ytdl-core";

import {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnectionStatus,
    AudioPlayer,
    VoiceConnection,
} from "@discordjs/voice";
import { SubcommandModule } from "types/common/discord.js";
import { AudioResource } from "@discordjs/voice";

type Queue = ReturnType<typeof createQueue>;

const guildQueue = new Collection<string, Queue>();

// Copied from api.js
const data = new SlashCommandBuilder()
    .setName("music")
    .setDescription("Calls music commands.");

const commands = new Collection<string, SubcommandModule>();

const musicFiles = fs
    .readdirSync(dirname(fileURLToPath(import.meta.url)) + "/music-subcommands")
    .filter((file) => file.endsWith(".js"));

for (const file of musicFiles) {
    const music = await import(`./music-subcommands/${file}`);
    commands.set(music.data.name, music);
    data.addSubcommand(music.data);
}

export { data };

export interface ModifiedInteraction extends ChatInputCommandInteraction {
    member: GuildMember;
    queue: Queue;
}

export async function execute(interaction: ModifiedInteraction) {
    await interaction.deferReply();
    const perms = interaction.member.permissions;
    if (
        !perms.has(PermissionsBitField.Flags.Connect) ||
        !perms.has(PermissionsBitField.Flags.RequestToSpeak) ||
        !perms.has(PermissionsBitField.Flags.Stream)
    ) {
        // If they don't have the required permissions
        await interaction.editReply(
            "You do not have the required permissions."
        );
        return;
    }
    const id = interaction.guild.id;
    const hasQueue = guildQueue.has(id);
    const musicCommandName = interaction.options.getSubcommand();

    if (musicCommandName === "save" || musicCommandName === "lyrics") {
        const musicCommand = commands.get(musicCommandName);
        if (!musicCommand) return;
        await musicCommand.execute(interaction);
        return;
    }

    // Creates the queue
    if (!hasQueue) {
        if (musicCommandName !== "play") {
            await interaction.editReply(
                "There is not a currently active music instance."
            );
            return;
        }
        if (!interaction.member.voice.channel) {
            await interaction.editReply("You need to be in a voice channel.");
            return;
        }
        const firstSongs = (await commands
            .get("play")
            .execute(interaction)) as unknown as Array<any>; // TODO: Create a getSongs helper function.
        // console.log(firstSongs);
        // const trim = (str, max) =>
        //     str.length > max ? `${str.slice(0, max - 3)}...` : str;
        // await interaction.editReply(
        //     "```json\n" +
        //         trim(JSON.stringify(firstSongs, null, 4), 1985) +
        //         "```"
        // );
        if (!firstSongs) return;
        const queue = createQueue(interaction, firstSongs);
        guildQueue.set(id, queue);
        return;
    }

    const musicCommand = commands.get(musicCommandName);
    if (!musicCommand) return;

    interaction.queue = guildQueue.get(id);

    try {
        await musicCommand.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: "There was an error while executing this music command!",
            // ephemeral: true,
        });
    }
}

const formatOptions = {
    filter: (format: ytdl.videoFormat) => !format.hasVideo && format.hasAudio,
    quality: "highestaudio",
    highWaterMark: 1 << 25, // solution?
    dlChunkSize: 1 << 30, // solution?
} as ytdl.downloadOptions;

function createQueue(interaction: ModifiedInteraction, firstSongs: any[]) {
    const voiceChannel = interaction.member.voice.channel;

    const { guild } = interaction;
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
    });

    const maxAudioBitrate = voiceChannel.bitrate / 1000; // kbps

    const player = createAudioPlayer();

    connection.on("stateChange", (oldState, newState) => {
        console.log(
            `Connection transitioned from ${oldState.status} to ${newState.status}`
        );
        if (newState.status === VoiceConnectionStatus.Disconnected) {
            songs.length = 0;
            queue.forceSkip = true;
            player.stop(true);
            // guildQueue.delete(guild.id);
            // connection.destroy();
            textChannel
                .send("Force disconnected.")
                .catch((err: any) => console.error(err));
        }
    });

    player.on("stateChange", (oldState, newState) => {
        console.log(
            `Audio player transitioned from ${oldState.status} to ${newState.status}`
        );
        if (newState.status === AudioPlayerStatus.AutoPaused) {
            songs.length = 0;
            queue.forceSkip = true;
            player.stop(true);
            textChannel
                .send("Random AutoPause?")
                .catch((err: any) => console.error(err));
        }
    });

    const songs = [...firstSongs];

    const textChannel = interaction.channel;

    const queue = {
        voiceChannel,
        guild,
        textChannel,
        connection,
        player,
        resource: null as AudioResource<null>,
        songs,
        repeatSong: false,
        loopQueue: false,
        forceSkip: false,
    };

    connection.subscribe(player);

    player.on("error", (error) => {
        textChannel
            .send(`Error Playing Song: "${queue.songs[0].title}"`)
            .catch((err) => console.error(err));
        console.error(error);
    });

    playNextSong(queue);

    player.on(AudioPlayerStatus.Idle, () => {
        modifyCurrentSong(queue);
        playNextSong(queue);
    });

    return queue;
}

function modifyCurrentSong(queue: Queue) {
    const { songs, repeatSong, loopQueue, forceSkip } = queue;

    const song = songs.shift();
    if (forceSkip) {
        queue.forceSkip = false;
        return;
    }
    if (repeatSong) {
        songs.unshift(song);
    } else if (loopQueue) {
        songs.push(song);
    }
}

function playNextSong(queue: Queue) {
    const { guild, textChannel, connection, player, songs } = queue;

    // Deleting the queue
    if (songs.length === 0) {
        guildQueue.delete(guild.id);
        connection.destroy();
        return;
    }
    console.log(songs[0]);
    textChannel
        .send(`Now Playing "${songs[0].title}"`)
        .catch((err: any) => console.error(err));
    // It sometimes doesn't work if the song length is too long
    let delay: string | number | NodeJS.Timeout;
    const stream = ytdl(songs[0].url, formatOptions);
    stream.on("info", (videoInfo, videoFormat) => {
        // console.log(videoInfo);
        // console.log(videoFormat);
    });
    let streamError = false;
    stream.on("error", (error) => {
        // console.error(error);
    });
    stream.on("progress", (length, downloaded, totallength) => {
        if (Number.isNaN(totallength) && !streamError) {
            streamError = true;
            console.error("Error PLaying Song:", songs[0].url);
            textChannel
                .send(`Error Playing "${songs[0].title}"`)
                .catch((err: any) => console.error(err));
            queue.forceSkip = true;
            player.stop(true);
            // modifyCurrentSong(queue);
            // playNextSong(queue);
        }
        clearTimeout(delay);
        delay = setTimeout(() => {
            console.log({ length, downloaded, totallength });
        }, 2000);
    });
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        // inlineVolume: true,
    });
    // console.log(resource.volume.volume);
    // resource.volume.setVolume(1);
    // console.log(resource.volume.volume);
    player.play(resource);
    queue.resource = resource;
}
