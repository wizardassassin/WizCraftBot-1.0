import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import fetch from "node-fetch";
import { getPingColor, Timer } from "#utils/utils";

export const data = new SlashCommandSubcommandBuilder()
    .setName("dog")
    .setDescription("Calls the Dog API.");

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    const json = await res.json();
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new MessageEmbed()
        .setTitle("Dog API")
        .setURL("https://dog.ceo/dog-api/")
        .addField("Response Time", String(time.toFixed(4)) + "ms")
        .setColor(0xf1c40f)
        .setImage(json.message)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: pingColor.url });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
