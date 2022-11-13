import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    ComponentType,
    EmbedBuilder,
    SelectMenuBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { sleep } from "#utils/utils";

const data = new SlashCommandSubcommandBuilder()
    .setName("button")
    .setDescription("Button command.");

export { data };

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("primary")
            .setLabel("Primary")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("😀"),
        new ButtonBuilder()
            .setCustomId("p2")
            .setLabel("p2")
            .setStyle(ButtonStyle.Secondary)
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("0")
            .setLabel("p3")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("1")
            .setLabel("p4")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("2")
            .setLabel("p5")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("3")
            .setLabel("p6")
            .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder("Nothing selected")
            .addOptions(
                {
                    label: "Select me",
                    description: "This is a description",
                    value: "first_option",
                },
                {
                    label: "You can select me too",
                    description: "This is also a description",
                    value: "second_option",
                }
            )
    );

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Title")
        .setURL("https://github.com/")
        .setDescription("A description.")
        .addFields({ name: "Cool Field", value: "Penguin" })
        .setAuthor({
            name: interaction.client.user.tag,
            iconURL: interaction.client.user.avatarURL(),
            url: "https://github.com/wizardassassin/WizCraftBot-1.0",
        })
        .setTimestamp()
        .setFooter({
            text: "Have a nice day!",
            iconURL: interaction.client.user.avatarURL(),
        });

    const reply = await interaction.reply({
        content: "Pong!",
        embeds: [embed],
        components: [row, row3, row2],
        fetchReply: true,
    });

    /**
     *
     * @param {import("discord.js").SelectMenuInteraction | import("discord.js").ButtonInteraction} i
     * @returns boolean
     */
    const filter = (i) =>
        i.user.id === interaction.user.id && i.message.id === reply.id;

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        // time: 15000,
        idle: 5000,
    });

    collector.on("collect", async (i) => {
        // await i.deferUpdate();
        // await sleep(4000);
        // await i.editReply({ content: "A button was clicked!", components: [] });
        for (const comp of row3.components) {
            if (comp.data.custom_id === i.customId) {
                comp.setDisabled(true);
            }
        }
        await i.update({
            content: "A button was clicked!",
            components: [row3],
        });
    });

    collector.on("end", (collected) =>
        console.log(`Collected ${collected.size} items`)
    );
}
