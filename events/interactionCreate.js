export const name = "interactionCreate";
export async function execute(interaction) {
    const { client } = interaction;
    console.log(
        `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction [${interaction.commandName}].`
    );

    if (!interaction.isCommand()) return;

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
