import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info!")
    .addUserOption((option) =>
        option.setName("user").setDescription("User to get information about.")
    );
export async function execute(interaction) {
    let user = interaction.options.getUser("user") || interaction.user;
    let guildMember = await interaction.guild.members.fetch(user.id);
    let embed = new MessageEmbed()
        .setTitle("User Information")
        .addField("Player Name", user.username)
        .addField("Tag", user.tag)
        .addField("Join Date", String(guildMember.joinedAt))
        .addField("Creation Date", String(user.createdAt))
        .setColor(0xf1c40f)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp()
        .setFooter("Have a nice day!");
    await interaction.reply({ embeds: [embed] });
    // `>>> **Your tag:** ${interaction.user.tag}\n**Your id:** ${interaction.user.id}`
}