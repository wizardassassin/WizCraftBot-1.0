import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import fetch from "node-fetch";

export const data = new SlashCommandSubcommandBuilder()
    .setName("numbers")
    .setDescription("Calls the Numbers API.")
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("Type of response. Default: trivia")
            .addChoice("trivia", "trivia")
            .addChoice("math", "math")
            .addChoice("date", "date")
            .addChoice("year", "year")
    )
    .addIntegerOption((option) =>
        option
            .setName("integer")
            .setDescription(
                "A number you want to call the API on (ignore if using type: date). Default: random"
            )
    )
    .addIntegerOption((option) =>
        option
            .setName("month")
            .setDescription(
                "A number you want to call the API on (ignore if NOT using type: date). Default: random"
            )
    )
    .addIntegerOption((option) =>
        option
            .setName("day")
            .setDescription(
                "A number you want to call the API on (ignore if NOT using type: date). Default: random"
            )
    );

export async function execute(interaction) {
    await interaction.deferReply();

    const type = interaction.options.getString("type") || "trivia";
    const integer = interaction.options.getInteger("integer") || "random";
    const month = interaction.options.getInteger("month");
    const day = interaction.options.getInteger("day");
    let number = integer;

    if (type == "date" && month && day) number = `${month}/${day}`;

    const startTime = performance.now();
    const res = await fetch(`http://numbersapi.com/${number}/${type}`);
    const endTime = performance.now();
    const text = await res.text();
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
        .setTitle("Numbers API")
        .setURL("http://numbersapi.com/")
        .addField("Result", String(text))
        .addField("Response Time", String(time.toFixed(4)) + "ms")
        .setColor(0xf1c40f)
        .setTimestamp()
        .setFooter("Have a nice day!", url);
    await interaction.editReply({ embeds: [embed] });
}
