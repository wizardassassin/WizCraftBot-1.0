import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { getPingColor, Timer } from "#utils/utils";

export const data = new SlashCommandSubcommandBuilder()
    .setName("yesno")
    .setDescription("Calls the Yes No API.");

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch("https://yesno.wtf/api");
    const json = await res.json();
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new MessageEmbed()
        .setTitle("Yes No API")
        .setURL("https://yesno.wtf/")
        .addField("Answer", String(json.answer))
        .addField(
            "Response Time",
            String((endTime - startTime).toFixed(4)) + "ms"
        )
        .setColor(0xf1c40f)
        .setImage(json.image)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: pingColor.url });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
