import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("server")
    .setDescription("Replies with server info!");
/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    // let owner = await interaction.guild.members.fetch(interaction.guild.ownerId);
    let owner = await interaction.client.users.fetch(interaction.guild.ownerId);
    // let owner = interaction.guild.members.cache.get(interaction.guild.ownerId);
    // console.log(interaction.guild.members.cache.size);
    let embed = new EmbedBuilder()
        .setTitle("Server Information")
        .addFields([
            { name: "Current Server", value: interaction.guild.name },
            {
                name: "Description",
                value: interaction.guild.description || "N/A",
            },
            {
                name: "Member Count",
                value: String(interaction.guild.memberCount),
            },
            { name: "Owner", value: owner.user.tag },
            {
                name: "Creation Date",
                value: String(interaction.guild.createdAt),
            },
            {
                name: "Availability",
                value: String(interaction.guild.available),
            },
        ])
        .setColor(0xf1c40f)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: "Have a nice day!" });
    await interaction.reply({ embeds: [embed] });
    // `>>> **Server name:** ${interaction.guild.name}\n**Total members:** ${interaction.guild.memberCount}`
}
