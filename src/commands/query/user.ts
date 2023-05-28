import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info!")
    .addUserOption((option) =>
        option.setName("user").setDescription("User to get information about.")
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    let user = interaction.options.getUser("user") || interaction.user;
    let guildMember = await interaction.guild.members.fetch(user.id);
    // let guildMember = await interaction.client.users.fetch(user.id);
    // let guildMember = interaction.guild.members.cache.get(user.id);
    // console.log(interaction.guild.members.cache.size);
    let embed = new EmbedBuilder()
        .setTitle("User Information")
        .addFields(
            {
                name: "Player Name",
                value: `${guildMember.displayName} (${user.tag})`,
            },
            { name: "Join Date", value: String(guildMember.joinedAt) },
            { name: "Creation Date", value: String(user.createdAt) }
        )
        .setColor(0xf1c40f)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: "Have a nice day!" });
    await interaction.reply({ embeds: [embed] });
    // `>>> **Your tag:** ${interaction.user.tag}\n**Your id:** ${interaction.user.id}`
}
