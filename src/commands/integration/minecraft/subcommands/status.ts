import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import mcServerStatus from "minecraft-server-util";
import { Timer } from "#utils/timer.js";

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
    )
    .addStringOption((option) =>
        option
            .setName("server")
            .setDescription("Type of minecraft server (defaults to java).")
            .addChoices(
                { name: "java", value: "java" },
                { name: "bedrock", value: "bedrock" }
            )
    );

export { data };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const options = {
    timeout: 1000 * 5,
    enableSRV: true,
};

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    // TODO: Make sure to parse input
    // TODO: Add bedrock support
    let ip = interaction.options.getString("ip") || "play.hypixel.net";
    let port = interaction.options.getInteger("port") ?? 25565;
    let server = interaction.options.getInteger("server") || "java";

    const colonInd = ip.indexOf(":");
    if (colonInd !== -1) {
        port = Number(ip.slice(colonInd + 1)) || port;
        ip = ip.slice(0, colonInd);
        console.log(ip.slice(colonInd + 1));
    }

    console.log({
        tag: interaction.user.tag,
        ip,
        port,
        server,
    });

    if (port <= 0 || port > 65535) {
        port = 25565;
    }

    const timer = new Timer();
    timer.start();
    let result;
    try {
        result = await mcServerStatus.status(ip, port, options);
        // console.log(result);
    } catch (error) {
        console.error(error);
        timer.stop();
        const duration = timer.duration();
        await sleep(options.timeout - duration);
        await interaction.editReply("Server is offline (probably).");
        return;
    }
    timer.stop();
    const duration = timer.duration();

    // Negative numbers should be fine
    await sleep(options.timeout - duration);

    const time = result.roundTripLatency;
    let icon = "";
    if (time < 90) icon = "884158152973615105";
    else if (time < 160) icon = "884158153011376208";
    else if (time < 200) icon = "884158153103638548";
    else icon = "884158153044934666";
    const url = `https://cdn.discordapp.com/emojis/${icon}.png`;

    const embed = new EmbedBuilder()
        .setTitle("Minecraft Server Status")
        .setURL("https://github.com/PassTheMayo/minecraft-server-util") // https://www.npmjs.com/package/minecraft-server-util
        .addFields(
            {
                name: "Server IP",
                value: String(ip),
            },
            {
                name: "Version",
                value: `${String(result.version.name).replace(
                    /§[0-9a-g]/g,
                    ""
                )} (Protocol ${String(result.version.protocol)})`,
            },
            {
                name: "Players",
                value: `${String(result.players.online)}/${String(
                    result.players.max
                )}`,
            },
            {
                name: "Sample Players",
                value: `${JSON.stringify(
                    (result.players.sample || []).map(({ id, name }) =>
                        `${name} (${id})`
                            .replace(/§[0-9a-g]/g, "")
                            .replace(/https:\/\//g, "https\\://")
                    ),
                    null,
                    2
                )}`,
            },
            {
                name: "MOTD",
                value: String(result.motd.clean.trim()),
            },
            {
                name: "srvRecord",
                value: JSON.stringify(result.srvRecord || {}),
            },
            {
                name: "Roundtrip Latency",
                value: String(result.roundTripLatency) + "ms",
            }
        )
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
