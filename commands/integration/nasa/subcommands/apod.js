import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { performance } from "perf_hooks";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { getPingColor, URLWrapper } from "#utils/utils.js";

const data = new SlashCommandSubcommandBuilder()
    .setName("apod")
    .setDescription("Gets the Astronomy Picture of the Day.");

export { data };

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    await interaction.deferReply();

    const url = URLWrapper("https://api.nasa.gov/planetary/apod", {
        api_key: process.env.US_GOV_API_KEY,
    });
    const res = await fetch(url);
    const json = await res.json();
    if (json.media_type != "image") {
        console.error({
            date: json.date,
            media_type: json.media_type,
            url: json.url,
        });
    }

    const time = 100;
    const pingColorFile = getPingColor(time);

    const embed = new MessageEmbed()
        .setTitle("Astronomy Picture of the Day (APOD)")
        .setURL("https://api.nasa.gov/")
        .setImage("https://www.youtube.com/embed/liapnqj9GDc?rel=0")
        .addField("Test 2", `https://stefanom.org/spc/game.php`)
        .setColor(0xf1c40f)
        .setTimestamp()
        .setFooter({
            text: "Have a nice day!  •  Pizza +1",
            iconURL: `attachment://${pingColorFile.name}`,
        });

    await interaction.editReply({
        embeds: [embed],
        files: [pingColorFile],
    });
}
