import { ChannelType, Events } from "discord.js";

export const name = Events.InteractionCreate;

/**
 *
 * @param {import("discord.js").Interaction} interaction
 */
export async function execute(interaction) {
    const { client } = interaction;
    console.log(
        `${interaction.user.tag} in ${interaction.guild?.name} | #${interaction.channel?.name} triggered an interaction.`
    );

    // console.log(interaction.channel);
    // console.log(interaction.guild);

    if (
        interaction.channel?.type === ChannelType.DM ||
        interaction.channel?.type === ChannelType.GroupDM ||
        (interaction.guild === null && interaction.channel === null)
    ) {
        console.log({ channel: interaction.channel, guild: interaction.guild });
        console.log(`DM Interaction`);
        interaction
            .reply({
                content: "Error: Command might have been sent though a DM.",
                ephemeral: true,
            })
            .catch((rej) => {
                console.error(rej);
            });
        return;
    }

    if (interaction.isButton()) {
        console.log("Button");
        // return;
    }

    if (interaction.isSelectMenu()) {
        console.log("Select Menu");
        // return;
    }

    if (interaction.isMessageComponent()) {
        if (!client.componentCollectors.has(interaction.message.id)) {
            console.log("Timed Out Message Component");
            interaction.reply({
                content: "Error: That message component might have timed out.",
                ephemeral: true,
            });
        } else if (
            client.componentCollectors.get(interaction.message.id) ??
            interaction.user.id !== interaction.user.id
        ) {
            console.log("User Specific Message Component");
            interaction.reply({
                content:
                    "Error: That message component might be user specific.",
                ephemeral: true,
            });
        }
    }

    if (!interaction.isChatInputCommand()) return;

    console.log("Chat Input Command");

    console.log(
        interaction.commandName,
        interaction.options.getSubcommandGroup(false),
        interaction.options.getSubcommand(false)
    );

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
