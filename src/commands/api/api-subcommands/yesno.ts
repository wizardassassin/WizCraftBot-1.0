import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import fetch from "node-fetch";
import { getPingColor } from "#utils/utils.js";
import { Timer } from "#utils/timer.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("yesno")
    .setDescription("Calls the Yes No API.");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch("https://yesno.wtf/api");
    const json: any = await res.json(); // TODO: typedef?
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new EmbedBuilder()
        .setTitle("Yes No API")
        .setURL("https://yesno.wtf/")
        .addFields({ name: "Answer", value: String(json.answer) })
        .setColor(0xf1c40f)
        .setImage(json.image)
        .setTimestamp()
        .setFooter({
            text: `Have a nice day!  •  ${time.toFixed(4)}ms`,
            iconURL: pingColor.url,
        });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
