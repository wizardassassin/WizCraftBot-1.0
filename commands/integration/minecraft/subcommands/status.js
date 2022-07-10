import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { performance } from "perf_hooks";
import { MessageEmbed } from "discord.js";
import util from "minecraft-server-util";

const data = new SlashCommandSubcommandBuilder()
    .setName("status")
    .setDescription("Retrieves the status of minecraft servers.")
    .addStringOption((option) =>
        option
            .setName("ip")
            .setDescription("IP of the minecraft server.")
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("port")
            .setDescription("Port of the minecraft server (defaults to 25565).")
    );

export { data };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const options = {
    timeout: 1000 * 5,
    enableSRV: true,
};

export async function execute(interaction) {
    await interaction.deferReply();

    // TODO: Make sure to parse input
    let ip = interaction.options.getString("ip") || "play.hypixel.net";
    let port = interaction.options.getInteger("port") ?? 25565;

    if (port < 0 || port > 65535) {
        port = 25565;
    }

    const start = performance.now();
    let result;
    try {
        result = await util.status(ip, port, options);
        // console.log(result);
    } catch (error) {
        console.error(error);
        const stop = performance.now();
        const duration = stop - start;
        await sleep(options.timeout - duration);
        await interaction.editReply("Server is offline (probably).");
        return;
    }
    const stop = performance.now();
    const duration = stop - start;

    // Negative numbers should be fine
    await sleep(options.timeout - duration);

    const time = result.roundTripLatency;
    let icon = "";
    if (time < 90) icon = "884158152973615105";
    else if (time < 160) icon = "884158153011376208";
    else if (time < 200) icon = "884158153103638548";
    else icon = "884158153044934666";
    const url = `https://cdn.discordapp.com/emojis/${icon}.png`;

    const embed = new MessageEmbed()
        .setTitle("Minecraft Server Status")
        .addField("Server IP", String(ip))
        .addField(
            "Version",
            `${String(result.version.name).replace(
                /§[0-9a-g]/g,
                ""
            )} (Protocol ${String(result.version.protocol)})`
        )
        .addField(
            "Players",
            `${String(result.players.online)}/${String(result.players.max)}`
        )
        .addField(
            "Sample Players",
            `${JSON.stringify(
                (result.players.sample || []).map(({ id, name }) =>
                    `${name} (${id})`.replace(/§[0-9a-g]/g, "").replace(/https:\/\//g, "https\\://")
                ),
                null,
                2
            )}`
        )
        .addField("MOTD", String(result.motd.clean.trim()))
        .addField("srvRecord", JSON.stringify(result.srvRecord || {}))
        .addField("Roundtrip Latency", String(result.roundTripLatency) + "ms")
        .setColor(0xf1c40f)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: url });
    // .setURL("http://numbersapi.com/")

    let favicon;
    if (result.favicon) {
        embed.setThumbnail("attachment://favicon.png");
        favicon = {
            attachment: Buffer.from(result.favicon.split(",")[1], "base64"),
            name: "favicon.png",
        };
        await interaction.editReply({
            embeds: [embed],
            files: [favicon],
        });
        return;
    }

    await interaction.editReply({
        embeds: [embed],
    });
}
