import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("repeat")
    .setDescription("Allows the song or queue to repeat.")
    .addStringOption((option) =>
        option
            .setName("scope")
            .setDescription("The scope of the repeat(default: song).")
            .addChoices(
                { name: "song", value: "song" },
                { name: "queue", value: "queue" }
            )
    )
    .addStringOption((option) =>
        option
            .setName("repeat")
            .setDescription(
                "Whether or not to repeat the song or queue(default: toggle)."
            )
            .addChoices(
                { name: "true", value: "true" },
                { name: "false", value: "false" },
                { name: "toggle", value: "toggle" }
            )
    );

/**
 *
 *
 * @param {CommandInteraction} interaction
 *
 */
export async function execute(interaction) {
    const scope = interaction.options.getString("scope") ?? "song";
    const repeat = interaction.options.getString("repeat") ?? "toggle";

    const { queue } = interaction;

    if (scope === "song") {
        if (repeat === "toggle") {
            queue.repeatSong = !queue.repeatSong;
        } else if (repeat === "true") {
            queue.repeatSong = true;
        } else {
            queue.repeatSong = false;
        }
    } else {
        if (repeat === "toggle") {
            queue.loopQueue = !queue.loopQueue;
        } else if (repeat === "true") {
            queue.loopQueue = true;
        } else {
            queue.loopQueue = false;
        }
    }

    await interaction.editReply(`Done.`);
}