import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { getPingColor } from "#utils/utils.js";
import { Timer } from "#utils/timer.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("dog")
    .setDescription("Calls the Dog API.");

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
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    const json: any = await res.json(); // TODO: typedef?
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new EmbedBuilder()
        .setTitle("Dog API")
        .setURL("https://dog.ceo/dog-api/")
        .setColor(0xf1c40f)
        .setImage(json.message)
        .setTimestamp()
        .setFooter({
            text: `Have a nice day!  •  ${time.toFixed(4)}ms`,
            iconURL: pingColor.url,
        });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
