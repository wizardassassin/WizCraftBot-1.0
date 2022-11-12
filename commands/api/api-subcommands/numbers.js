import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { getPingColor, Timer } from "#utils/utils";

export const data = new SlashCommandSubcommandBuilder()
    .setName("numbers")
    .setDescription("Calls the Numbers API.")
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("Type of response. Default: trivia")
            .addChoices(
                { name: "trivia", value: "trivia" },
                { name: "math", value: "math" },
                { name: "date", value: "date" },
                { name: "year", value: "year" }
            )
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

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();

    const type = interaction.options.getString("type") || "trivia";
    const integer = interaction.options.getInteger("integer") || "random";
    const month = interaction.options.getInteger("month");
    const day = interaction.options.getInteger("day");
    let number = integer;

    if (type === "date" && month && day) number = `${month}/${day}`;

    const timer = new Timer();
    timer.start();
    const res = await fetch(`http://numbersapi.com/${number}/${type}`);
    const text = await res.text();
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new EmbedBuilder()
        .setTitle("Numbers API")
        .setURL("http://numbersapi.com/")
        .addFields({ name: "Result", value: String(text) })
        .setColor(0xf1c40f)
        .setTimestamp()
        .setFooter({
            text: `Have a nice day!  •  ${time.toFixed(4)}ms`,
            iconURL: pingColor.url,
        });
    await interaction.editReply({ embeds: [embed], files: [pingColor.file] });
}
