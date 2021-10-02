import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Removes the song at the specified position.")
    .addIntegerOption((option) =>
        option
            .setName("position")
            .setDescription("The position of the song in the queue.")
            .setRequired(true)
    );
/**
 *
 * @param {CommandInteraction} interaction
 */
export async function execute(interaction) {
    const { queue } = interaction;
    const { songs } = queue;
    const songLength = songs.length;
    const index = interaction.options.getInteger("position");
    if (index <= 0 || index > songLength - 1) {
        await interaction.editReply("The position does not exist.");
        return;
    }
    const removed = songs.splice(index, 1);
    await interaction.editReply("Removed " + removed[0].title);
}
