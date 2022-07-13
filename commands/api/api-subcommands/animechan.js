import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import fetch from "node-fetch";
import { getPingColor, Timer } from "#utils/utils";

export const data = new SlashCommandSubcommandBuilder()
    .setName("animechan")
    .setDescription("Calls the AnimeChan API.")
    .addStringOption((option) =>
        option
            .setName("search")
            .setDescription("Search Type. Not Currently Functional.")
            .addChoices(
                { name: "random", value: "random2" },
                { name: "title", value: "title2" },
                { name: "name", value: "name2" },
                { name: "query", value: "query2" }
            )
    );

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch("https://animechan.vercel.app/api/random");
    const json = await res.json();
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new MessageEmbed()
        .setTitle("AnimeChan API")
        .setURL("https://github.com/RocktimSaikia/anime-chan")
        .addField("Anime", String(json.anime))
        .addField("Character", String(json.character))
        .addField("Quote", String(json.quote))
        .addField("Response Time", String(time.toFixed(4)) + "ms")
        .setColor(0xf1c40f)
        .setImage(json.image)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: pingColor.url });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
