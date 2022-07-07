import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
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

const options = {
    timeout: 1000 * 5,
    enableSRV: true,
};

export async function execute(interaction) {
    await interaction.deferReply();

    // TODO: Make sure to parse input
    let ip = "play.hypixel.net" || interaction.options.getString("ip");
    let port = interaction.options.getInteger("port") ?? 25565;

    if (port < 0 || port > 65535) {
        port = 25565;
    }

    let result;
    try {
        result = await util.status(ip, 25565, options);
        console.log(result);
    } catch (error) {
        console.error(error);
        await interaction.editReply("Server is offline (probably).");
        return;
    }

    const time = result.roundTripLatency;
    let icon = "";
    if (time < 90) icon = "884158152973615105";
    else if (time < 160) icon = "884158153011376208";
    else if (time < 200) icon = "884158153103638548";
    else icon = "884158153044934666";
    const url = `https://cdn.discordapp.com/emojis/${icon}.png`;

    let embed = new MessageEmbed()
        .setTitle("Minecraft Server Status")
        // .setImage(result.favicon)
        .addField("Server IP", String(ip))
        .addField("MOTD", String(result.motd.clean))
        .addField("Roundtrip Latency", String(result.roundTripLatency) + "ms")
        .setColor(0xf1c40f)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: url });
    // .setURL("http://numbersapi.com/")

    await interaction.editReply({ embeds: [embed] });
}
