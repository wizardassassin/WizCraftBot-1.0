import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("todo")
    .setDescription(
        "Replies with all the things I need or want to do with the bot."
    );
export async function execute(interaction) {
    const embed = new MessageEmbed()
        .setTitle("TODO")
        .setDescription(
            list
                .reduce((acc, cur, i) => acc + `\`${i + 1}.\` ${cur}\n`, "")
                .trim() || "Nothing to do... Strange..."
        )
        .setTimestamp()
        .setFooter("Have a nice day!");
    await interaction.reply({ embeds: [embed] });
}

const list = [
    "99% embed only replies.",
    "Remove command for the music bot.",
    "Pages for the queue command.",
    "More refined code.",
    "History api command.",
    "College acceptance command.",
];
