import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("server")
    .setDescription("Replies with server info!");
export async function execute(interaction) {
    let owner = await interaction.client.users.fetch(interaction.guild.ownerId);
    let embed = new MessageEmbed()
        .setTitle("Server Information")
        .addField("Current Server", interaction.guild.name)
        .addField("Description", interaction.guild.description || "N/A")
        .addField("Member Count", String(interaction.guild.memberCount))
        .addField("Owner", owner.tag)
        .addField("Creation Date", String(interaction.guild.createdAt))
        .addField("Availability", String(interaction.guild.available))
        .setColor(0xf1c40f)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: "Have a nice day!" });
    await interaction.reply({ embeds: [embed] });
    // `>>> **Server name:** ${interaction.guild.name}\n**Total members:** ${interaction.guild.memberCount}`
}
