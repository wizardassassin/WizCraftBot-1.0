import { ActionRowBuilder, ComponentBuilder } from "discord.js";

export const name = "interactionCreate";

/**
 *
 * @param {import("discord.js").Interaction} interaction
 */
export async function execute(interaction) {
    const { client } = interaction;
    console.log(
        `${interaction.user.tag} in #${interaction.channel?.name} triggered an interaction.`
    );

    if (interaction.isButton()) {
        console.log("Button");
        return;
    }

    if (interaction.isSelectMenu()) {
        console.log("Select Menu");
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    console.log("Chat Input Command");

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
}
