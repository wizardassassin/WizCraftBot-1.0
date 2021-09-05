import { SlashCommandBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
    .setName("api")
    .setDescription("Makes a call to an API.")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("user")
            .setDescription("Info about a user")
            .addUserOption((option) =>
                option.setName("target").setDescription("The user")
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("server").setDescription("Info about the server")
    );
export async function execute(interaction) {
    if (interaction.options.getSubcommand() === "user") {
        const user = interaction.options.getUser("target");

        if (user) {
            await interaction.reply(
                `Username: ${user.username}\nID: ${user.id}`
            );
        } else {
            await interaction.reply(
                `Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`
            );
        }
    } else if (interaction.options.getSubcommand() === "server") {
        await interaction.reply(
            `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
        );
    }
}
