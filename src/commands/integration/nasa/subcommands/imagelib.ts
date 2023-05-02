import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { getPingColor, URLWrapper, getReplyTemplate } from "#utils/utils.js";
import { Timer } from "#utils/timer.js";
const data = new SlashCommandSubcommandBuilder()
    .setName("imagelib")
    .setDescription("Image and Video Library (also audio).")
    .addStringOption((option) =>
        option
            .setName("query")
            .setDescription("What to search for.")
            .setRequired(true)
    );

export { data };

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(
    interaction: import("discord.js").ChatInputCommandInteraction
) {
    await interaction.deferReply();

    const query = interaction.options.getString("query") || "milky way";

    const url = URLWrapper("https://images-api.nasa.gov/search", {
        q: query,
    });
    const timer = new Timer();
    timer.start();
    const res = await fetch(url);
    const json: any = await res.json(); // TODO: typedef?
    timer.stop();

    const time = timer.duration();
    const pingColor = getPingColor(time, 2);

    const totalHits = String(json.collection.metadata.total_hits);

    if (Number(totalHits) === 0) {
        await interaction.editReply("No results were found.");
        return;
    }

    const items = json.collection.items;
    const randomitem = items[Math.floor(Math.random() * items.length)];
    // const randomitem = items[10];
    if (randomitem.data.length !== 1) {
        console.error("Data", randomitem.data);
    }
    if ((randomitem.links?.length ?? 3) > 2) {
        console.error("Links", randomitem.links);
    }

    const title = randomitem.data[0].title;

    let sum = 0;
    let description = randomitem.data[0].description;
    if (description.length > 2000) {
        description = description.slice(0, 2000) + " ...";
    }
    const split = description.split(" ");
    const mid = split.findIndex((x) => {
        sum += x.length + 1;
        return sum >= description.length / 2;
    });
    const first = split.slice(0, mid).join(" ") + " ...";
    const second = "... " + split.slice(mid).join(" ");

    const location = randomitem.data[0].location || "N/A";
    const dateCreated = randomitem.data[0].date_created;

    const thumbnail = randomitem.links?.[0].href;

    if (!thumbnail?.endsWith("~thumb.jpg")) {
        console.error("Thumbnail", randomitem.links);
    }

    const nasaId = randomitem.data[0].nasa_id;
    const mediaType = randomitem.data[0].media_type;
    let fileExtension = "jpg";
    switch (mediaType) {
        case "image":
            fileExtension = "jpg";
            break;
        case "video":
            fileExtension = "mp4";
            break;
        case "audio":
            fileExtension = "mp3";
            break;
        default:
            console.error(randomitem.data);
            break;
    }
    const originalURL = `http://images-assets.nasa.gov/${mediaType}/${nasaId}/${nasaId}~orig.${fileExtension}`;
    const embed = new EmbedBuilder()
        .setTitle("NASA Image and Video Library")
        .setURL("https://api.nasa.gov/")
        .addFields({ name: "Title", value: title });
    if (thumbnail) {
        embed.setImage(encodeURI(thumbnail));
    }
    if (description.length > 500) {
        embed.addFields(
            { name: "Description", value: first },
            { name: "Description Cont..", value: second }
        );
    } else {
        embed.addFields({ name: "Description", value: description });
    }

    embed.addFields(
        { name: "Url", value: encodeURI(originalURL) },
        { name: "Location", value: location },
        { name: "Date Created", value: dateCreated },
        { name: "Total Hits", value: totalHits }
    );

    const reply = getReplyTemplate(
        embed,
        interaction.client.user,
        pingColor,
        time
    );

    await interaction.editReply(reply);
}
