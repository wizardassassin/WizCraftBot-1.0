import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import fetch from "node-fetch";

export const data = new SlashCommandSubcommandBuilder()
    .setName("insult")
    .setDescription("Calls the Evil Insult Generator API.");

export async function execute(interaction) {
    await interaction.deferReply();

    const startTime = performance.now();
    const res = await fetch(
        "https://evilinsult.com/generate_insult.php?lang=en&type=json"
    );
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
        .setTitle("Evil Insult Generator API")
        .setURL("https://evilinsult.com/api/")
        .addField("Insult", String(json.insult))
        .addField("Number", String(json.number))
        .addField("Created", String(Date(json.created)))
        .addField("Response Time", String(time.toFixed(4)) + "ms")
        .setColor(0xf1c40f)
        .setImage(json.image)
        .setTimestamp()
        .setFooter("Have a nice day!", url);
    await interaction.editReply({ embeds: [embed] });
}
