import { SlashCommandSubcommandBuilder } from "discord.js";
import { ModifiedInteraction } from "../music.js";

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
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 *
 */
export async function execute(interaction: ModifiedInteraction) {
    const scope = interaction.options.getString("scope") ?? "song";
    const repeat = interaction.options.getString("repeat") ?? "toggle";

    const { queue } = interaction;

    const prevRepeatSong = queue.repeatSong;
    const prevLoopQueue = queue.loopQueue;

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

    let formattedRepeatSong: string | boolean = queue.repeatSong;
    let formattedLoopQueue: string | boolean = queue.loopQueue;
    if (prevRepeatSong != formattedRepeatSong) {
        formattedRepeatSong = `*${formattedRepeatSong}*`;
    }
    if (prevLoopQueue != queue.loopQueue) {
        formattedLoopQueue = `*${formattedLoopQueue}*`;
    }

    await interaction.editReply(
        `\`repeatSong:\` **${formattedRepeatSong}**\n\`loopQueue:\` **${formattedLoopQueue}**`
    );
}
