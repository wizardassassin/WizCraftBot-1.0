import { getPingColor, getReplyTemplate } from "#utils/utils.js";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("presence")
    .setDescription("Gets presence information.")
    .addUserOption((option) =>
        option.setName("user").setDescription("User to get information about.")
    );
/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(
    interaction: import("discord.js").ChatInputCommandInteraction
) {
    const user = interaction.options.getUser("user") || interaction.user;
    const id = user.id;
    const db_user = await interaction.client.prisma.user.findUnique({
        where: {
            id: id,
        },
        select: {
            presences: true,
            isEnabled: true,
        },
    });
    if (!db_user) {
        await interaction.editReply("The user has not been created.");
        return;
    }

    if (!db_user.isEnabled) {
        await interaction.editReply("User has disabled presences.");
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle("Presence")
        .addFields(
            ...db_user.presences.map((x) => ({
                name: x.name,
                value: msFormat(x.updatedAt.getTime() - x.createdAt.getTime()),
            }))
        )
        .setThumbnail(user.displayAvatarURL());

    if (db_user.presences.length === 0) {
        embed.setDescription("No presences found.");
    }

    const reply = getReplyTemplate(
        embed,
        interaction.client.user,
        getPingColor(0),
        -1
    );

    await interaction.editReply(reply);
}

function msFormat(time: number) {
    let milliseconds = Math.floor(time);
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    return `${hours % 24} hours\n${minutes % 60} minutes\n${
        seconds % 60
    } seconds`;
}
