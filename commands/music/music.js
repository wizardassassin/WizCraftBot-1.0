import {
    Collection,
    PermissionsBitField,
    SlashCommandBuilder,
} from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import ytdl from "ytdl-core";
import {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";

const guildQueue = new Collection();

// Copied from api.js
const data = new SlashCommandBuilder()
    .setName("music")
    .setDescription("Calls music commands.");

const commands = new Collection();

const musicFiles = fs
    .readdirSync(dirname(fileURLToPath(import.meta.url)) + "/music-subcommands")
    .filter((file) => file.endsWith(".js"));

for (const file of musicFiles) {
    const music = await import(`./music-subcommands/${file}`);
    commands.set(music.data.name, music);
    data.addSubcommand(music.data);
}

export { data };

export async function execute(interaction) {
    await interaction.deferReply();
    if (
        !interaction.member.permissions.has(
            PermissionsBitField.Flags.Connect
        ) ||
        !interaction.member.permissions.has(
            PermissionsBitField.Flags.RequestToSpeak
        ) ||
        !interaction.member.permissions.has(PermissionsBitField.Flags.Stream)
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
    // Creates the queue
    if (!hasQueue) {
        if (musicCommandName != "play") {
            await interaction.editReply(
                "There is not a currently active music instance."
            );
            return;
        }
        if (!interaction.member.voice.channel) {
            await interaction.editReply("You need to be in a voice channel.");
            return;
        }
        const firstSongs = await commands.get("play").execute(interaction);
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
        musicCommand.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: "There was an error while executing this music command!",
            ephemeral: true,
        });
    }
}

const formatOptions = {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25, // solution?
    dlChunkSize: 1 << 30, // solution?
};

function createQueue(interaction, firstSongs) {
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
    });

    player.on("stateChange", (oldState, newState) => {
        console.log(
            `Audio player transitioned from ${oldState.status} to ${newState.status}`
        );
    });

    const songs = [...firstSongs];

    const textChannel = interaction.channel;

    const queue = {
        voiceChannel,
        guild,
        textChannel,
        connection,
        player,
        songs,
        repeatSong: false,
        loopQueue: false,
        forceSkip: false,
    };

    connection.subscribe(player);

    player.on("error", (error) => {
        console.error(error);
    });

    playNextSong(queue);

    player.on(AudioPlayerStatus.Idle, () => {
        modifyCurrentSong(queue);
        playNextSong(queue);
    });

    return queue;
}

function modifyCurrentSong(queue) {
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

function playNextSong(queue) {
    const { guild, connection, player, songs } = queue;

    // Deleting the queue
    if (songs.length == 0) {
        guildQueue.delete(guild.id);
        connection.destroy();
        return;
    }
    console.log(songs[0]);
    // It sometimes doesn't work if the song length is too long
    let delay;
    const stream = ytdl(songs[0].url, formatOptions);
    stream.on("progress", (length, downloaded, totallength) => {
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
}
