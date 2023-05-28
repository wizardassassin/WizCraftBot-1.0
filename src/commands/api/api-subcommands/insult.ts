import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import fetch from "node-fetch";
import { getPingColor } from "#utils/utils.js";
import { Timer } from "#utils/timer.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("insult")
    .setDescription("Calls the Evil Insult Generator API.");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const timer = new Timer();
    timer.start();
    const res = await fetch(
        "https://evilinsult.com/generate_insult.php?lang=en&type=json"
    );
    const json: any = await res.json(); // TODO: typedef?
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new EmbedBuilder()
        .setTitle("Evil Insult Generator API")
        .setURL("https://evilinsult.com/api/")
        .addFields(
            { name: "Insult", value: String(json.insult) },
            { name: "Number", value: String(json.number) }
        )
        .setColor(0xf1c40f)
        .setImage(json.image)
        .setTimestamp()
        .setFooter({
            text: `Have a nice day!  •  ${time.toFixed(4)}ms`,
            iconURL: pingColor.url,
        });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
