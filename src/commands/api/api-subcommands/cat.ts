import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { getPingColor } from "#utils/utils.js";
import { Timer } from "#utils/timer.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("cat")
    .setDescription("Calls the CATAAS(cat as a service) API.");

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(
    interaction: import("discord.js").ChatInputCommandInteraction
) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch("https://cataas.com/cat?json=true");
    const json: any = await res.json(); // TODO: typedef?
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new EmbedBuilder()
        .setTitle("CATAAS API")
        .setURL("https://cataas.com/")
        .setColor(0xf1c40f)
        .setImage("https://cataas.com/" + json.url)
        .setTimestamp()
        .setFooter({
            text: `Have a nice day!  •  ${time.toFixed(4)}ms`,
            iconURL: pingColor.url,
        });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
