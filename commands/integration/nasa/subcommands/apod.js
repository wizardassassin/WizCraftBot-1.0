import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { getPingColor, URLWrapper, Timer } from "#utils/utils";
import ytdl from "ytdl-core";

const data = new SlashCommandSubcommandBuilder()
    .setName("apod")
    .setDescription("Gets the Astronomy Picture of the Day.");

export { data };

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();
    const url = URLWrapper("https://api.nasa.gov/planetary/apod", {
        api_key: process.env.US_GOV_API_KEY,
    });
    const timer = new Timer();
    timer.start();
    const res = await fetch(url);
    const json = await res.json();
    timer.stop();
    if (json.media_type != "image") {
        console.error({
            date: json.date,
            media_type: json.media_type,
            url: json.url,
        });
    }

    const time = timer.duration();
    const pingColor = getPingColor(time, 2);
    const embed = new EmbedBuilder()
        .setTitle("Astronomy Picture of the Day (APOD)")
        .setURL("https://api.nasa.gov/")
        .setColor(0xf1c40f)
        .setTimestamp()
        .setFooter({
            text: `Have a nice day!  •  ${time.toFixed(4)}ms`,
            iconURL: pingColor.url,
        });

    const split = json.explanation.split(" ");
    const mid = Math.floor(split.length / 2);
    const first = split.slice(0, mid).join(" ") + " ...";
    const second = "... " + split.slice(mid).join(" ");

    embed.addFields(
        { name: "Title", value: json.title },
        { name: "Explanation", value: first },
        { name: "Explanation Cont...", value: second }
    );

    let content = "";
    if (json.media_type != "image") {
        const videoURL = String(json.url);
        try {
            const id = ytdl.getVideoID(videoURL);
            const newURL = URLWrapper("https://www.youtube.com/watch", {
                v: id,
            }).href;
            embed.addFields({ name: "Video", value: newURL });
            content = newURL;
        } catch (error) {
            console.error(error, videoURL);
            embed.addFields({ name: "Game", value: videoURL });
            content = videoURL;
        }
    } else {
        if (!json.hdurl) {
            console.log(json);
        } else {
            embed.addFields({ name: "HD Url", value: String(json.hdurl) });
        }
        const imgURL = json.url;
        embed.setImage(String(imgURL));
    }

    embed.addFields(
        { name: "Date", value: String(json.date) },
        { name: "Copyright", value: String(json.copyright ?? "Public Domain") }
    );

    await interaction.editReply({
        embeds: [embed],
        files: [pingColor.file],
    });
    if (content) {
        await interaction.followUp(content);
    }
}
