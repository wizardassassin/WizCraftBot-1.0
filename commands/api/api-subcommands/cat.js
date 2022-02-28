import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import fetch from "node-fetch";

export const data = new SlashCommandSubcommandBuilder()
    .setName("cat")
    .setDescription("Calls the CATAAS(cat as a service) API.");

export async function execute(interaction) {
    await interaction.deferReply();

    const startTime = performance.now();
    const res = await fetch("https://cataas.com/cat?json=true");
    const endTime = performance.now();
    const json = await res.json();
    const time = endTime - startTime;

    let icon = "";
    if (time < 500) icon = "884158152973615105";
    // < 0.5 sec Green Icon
    else if (time < 1000) icon = "884158153011376208";
    // < 1 sec Yellow Icon
    else if (time < 2000) icon = "884158153103638548";
    // < 2 sec Orange Icon
    else icon = "884158153044934666";
    // > 2 sec Red Icon
    const url = `https://cdn.discordapp.com/emojis/${icon}.png`;

    let embed = new MessageEmbed()
        .setTitle("CATAAS API")
        .setURL("https://cataas.com/")
        .addField("Response Time", String(time.toFixed(4)) + "ms")
        .setColor(0xf1c40f)
        .setImage("https://cataas.com/" + json.url)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: url });
    await interaction.editReply({ embeds: [embed] });
}
