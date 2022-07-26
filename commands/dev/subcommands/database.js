import { SlashCommandSubcommandBuilder } from "discord.js";

const data = new SlashCommandSubcommandBuilder()
    .setName("database")
    .setDescription("Database command.")
    .addIntegerOption((option) =>
        option
            .setName("number")
            .setDescription("Number to add to the database.")
    )
    .addBooleanOption((option) =>
        option
            .setName("save")
            .setDescription("Whether or not to save the database.")
    );

export { data };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
let inc = 0;

/**
 *
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function execute(interaction) {
    const db = interaction.client.database;
    const num = interaction.options.getInteger("number") ?? inc++;
    const saveDB = interaction.options.getBoolean("save") ?? false;

    db.data.increasing ||= [];

    db.data.increasing.push(num);

    let content = "```json\n" + JSON.stringify(db.data, null, 4) + "```";

    await interaction.reply({
        content,
    });

    if (saveDB) {
        await db.write();
        await interaction.followUp("Saved!");
    }
}
