import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info!")
    .addUserOption((option) =>
        option.setName("user").setDescription("User to get information about.")
    );
/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    let user = interaction.options.getUser("user") || interaction.user;
    // let guildMember = await interaction.guild.members.fetch(user.id);
    let guildMember = await interaction.client.users.fetch(user.id);
    // let guildMember = interaction.guild.members.cache.get(user.id);
    // console.log(interaction.guild.members.cache.size);
    let embed = new MessageEmbed()
        .setTitle("User Information")
        .addField("Player Name", guildMember.displayName)
        .addField("Tag", user.tag)
        .addField("Join Date", String(guildMember.joinedAt))
        .addField("Creation Date", String(user.createdAt))
        .setColor(0xf1c40f)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: "Have a nice day!" });
    await interaction.reply({ embeds: [embed] });
    // `>>> **Your tag:** ${interaction.user.tag}\n**Your id:** ${interaction.user.id}`
}
