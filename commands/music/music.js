import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, Permissions } from "discord.js";
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
    if (
        !interaction.member.permissions.has(Permissions.FLAGS.CONNECT) ||
        !interaction.member.permissions.has(Permissions.FLAGS.SPEAK)
    ) {
        // If they don't have the required permissions
        await interaction.reply("You do not have the required permissions.");
        return;
    }
    const id = interaction.guild.id;
    const hasQueue = guildQueue.has(id);
    const musicCommandName = interaction.options.getSubcommand();
    if (!hasQueue) {
        if (musicCommandName != "play") {
            await interaction.reply(
                "There is not a currently active music instance."
            );
            return;
        }
        if (!interaction.member.voice.channel) {
            await interaction.reply("You need to be in a voice channel.");
            return;
        }
        const firstSongs = await commands.get("play").execute(interaction);
        // console.log(firstSongs);
        // const trim = (str, max) =>
        //     str.length > max ? `${str.slice(0, max - 3)}...` : str;
        // await interaction.reply(
        //     "```json\n" +
        //         trim(JSON.stringify(firstSongs, null, 4), 1985) +
        //         "```"
        // );
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
        await interaction.reply({
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

    connection.subscribe(player);

    player.on("error", (error) => {
        console.error(error);
    });

    const playNextSong = () => {
        if (songs.length == 0) {
            guildQueue.delete(guild.id);
            connection.destroy();
            return;
        }
        console.log(songs[0]);
        let delay;
        const stream = ytdl(songs[0].url, formatOptions).on(
            "progress",
            (length, downloaded, totallength) => {
                clearTimeout(delay);
                delay = setTimeout(() => {
                    console.log({ length, downloaded, totallength });
                }, 1500);
            }
        );
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
            // inlineVolume: true,
        });
        // console.log(resource.volume.volume);
        // resource.volume.setVolume(1);
        // console.log(resource.volume.volume);
        player.play(resource);
    };

    playNextSong();

    player.on(AudioPlayerStatus.Idle, () => {
        songs.shift();
        playNextSong();
    });

    return {
        channelId: voiceChannel.id,
        guildId: guild.id,
        connection,
        player,
        songs,
    };
}
