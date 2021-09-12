import { SlashCommandBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
    .setName("inputoutput")
    .setDescription("Testing command");
export async function execute(interaction) {
    await interaction.reply("io");

    const filter = (m) => true;
    const collector = interaction.channel.createMessageCollector({
        filter,
        time: 15000,
    });

    collector.on("collect", (m) => {
        console.log(`Collected ${m.content}`);
    });

    collector.on("end", (collected) => {
        console.log(`Collected ${collected.size} items`);
    });
}
