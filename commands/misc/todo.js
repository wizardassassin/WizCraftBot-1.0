import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("todo")
    .setDescription(
        "Replies with all the things I need or want to do with the bot."
    );
export async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setTitle("TODO")
        .setDescription(
            list
                .reduce((acc, cur, i) => acc + `\`${i + 1}.\` ${cur}\n`, "")
                .trim() || "Nothing to do... Strange..."
        )
        .setTimestamp()
        .setFooter({ text: "Have a nice day!" });
    await interaction.reply({ embeds: [embed] });
}

const list = [
    "Comments and JSDocs",
    "99% embed only replies.",
    "Pages for the queue command.",
    "More refined music bot logic.",
    "Option for looping the music queue x times.",
    "More refined code.",
    "History api command.",
    "Adding the ability to input options for the api.",
    "College acceptance command.",
    "Chess command.",
    "Add TypeScript.",
    "Add hypixel api integration.",
    "Place Response Time into the footer.",
    "Maybe use an AttachmentBuilder",
];
