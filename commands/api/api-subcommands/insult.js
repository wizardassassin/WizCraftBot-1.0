import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { getPingColor, Timer } from "#utils/utils";

export const data = new SlashCommandSubcommandBuilder()
    .setName("insult")
    .setDescription("Calls the Evil Insult Generator API.");

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch(
        "https://evilinsult.com/generate_insult.php?lang=en&type=json"
    );
    const json = await res.json();
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new MessageEmbed()
        .setTitle("Evil Insult Generator API")
        .setURL("https://evilinsult.com/api/")
        .addField("Insult", String(json.insult))
        .addField("Number", String(json.number))
        .addField("Response Time", String(time.toFixed(4)) + "ms")
        .setColor(0xf1c40f)
        .setImage(json.image)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: pingColor.url });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
