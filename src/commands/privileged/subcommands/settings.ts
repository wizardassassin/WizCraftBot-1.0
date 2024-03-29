import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("settings")
    .setDescription("Settings for privileged commands.")
    .addStringOption((option) =>
        option
            .setName("action")
            .setDescription("What to change the setting to.")
            .addChoices(
                { name: "delete", value: "delete" },
                { name: "enable", value: "enable" },
                { name: "disable", value: "disable" }
            )
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.user.id;
    const guildId = interaction.guildId;
    const action = interaction.options.getString("action") || "delete";

    let db_user = await interaction.client.prisma.user.findUnique({
        where: {
            id: id,
        },
    });

    if (!db_user) {
        if (action !== "enable") {
            await interaction.editReply("No user was found!");
            return;
        }
        await interaction.client.prisma.user.create({
            data: {
                id: id,
                isEnabled: true,
                guildId: guildId,
            },
        });
        await interaction.editReply("Created user!");
        return;
    }
    if (action === "delete") {
        await interaction.client.prisma.user.delete({
            where: {
                id: id,
            },
        });
        await interaction.editReply("Deleted user!");
        return;
    }
    if (action === "enable") {
        await interaction.client.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                isEnabled: true,
                guildId: guildId,
            },
        });
        await interaction.editReply("Enabled user!");
        return;
    }
    if (action === "disable") {
        await interaction.client.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                isEnabled: false,
            },
        });
        await interaction.editReply("Disabled user!");
        return;
    }
    await interaction.editReply("Unknown action.");
    return;
}
