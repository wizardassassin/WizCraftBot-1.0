import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { getPingColor } from "#utils/utils.js";
import { Timer } from "#utils/timer.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("animechan")
    .setDescription("Calls the AnimeChan API.")
    .addStringOption((option) =>
        option
            .setName("search")
            .setDescription("Search Type. Not Currently Functional.")
            .addChoices(
                { name: "random", value: "random2" },
                { name: "title", value: "title2" },
                { name: "name", value: "name2" },
                { name: "query", value: "query2" }
            )
    );

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
    const res = await fetch("https://animechan.vercel.app/api/random");
    const json: any = await res.json(); // TODO: typedef?
    timer.stop();
    const time = timer.duration();

    const pingColor = getPingColor(time, 2);

    let embed = new EmbedBuilder()
        .setTitle("AnimeChan API")
        .setURL("https://github.com/RocktimSaikia/anime-chan")
        .addFields(
            { name: "Anime", value: String(json.anime) },
            { name: "Character", value: String(json.character) },
            { name: "Quote", value: String(json.quote) }
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
