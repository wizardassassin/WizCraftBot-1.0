import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import fetch from "node-fetch";
import { getPingColor, Timer } from "#utils/utils";

export const data = new SlashCommandSubcommandBuilder()
    .setName("cat")
    .setDescription("Calls the CATAAS(cat as a service) API.");

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch("https://cataas.com/cat?json=true");
    const json = await res.json();
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new MessageEmbed()
        .setTitle("CATAAS API")
        .setURL("https://cataas.com/")
        .addField("Response Time", String(time.toFixed(4)) + "ms")
        .setColor(0xf1c40f)
        .setImage("https://cataas.com/" + json.url)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: pingColor.url });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
