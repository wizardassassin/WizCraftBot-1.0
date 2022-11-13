import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    SelectMenuBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { sleep } from "#utils/utils";
import pkg from "lodash";
const { shuffle } = pkg;

const data = new SlashCommandSubcommandBuilder()
    .setName("button2")
    .setDescription("Button2 command.")
    .addIntegerOption((option) =>
        option
            .setName("level")
            .setDescription("Tic Tac Toe Skill Level")
            .addChoices(
                { name: "easy", value: 0 },
                { name: "normal", value: 1 },
                { name: "hard", value: 2 },
                { name: "impossible", value: 3 }
            )
    );

export { data };

/**
 *
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
    const skillLevel = interaction.options.getInteger("level") ?? 0;
    const buttonArr = Array.from({ length: 9 }, (_, i) =>
        new ButtonBuilder()
            .setCustomId(String(i))
            .setLabel("_")
            .setStyle(ButtonStyle.Success)
    );
    const row1 = new ActionRowBuilder().addComponents(
        buttonArr[0],
        buttonArr[1],
        buttonArr[2]
    );
    const row2 = new ActionRowBuilder().addComponents(
        buttonArr[3],
        buttonArr[4],
        buttonArr[5]
    );
    const row3 = new ActionRowBuilder().addComponents(
        buttonArr[6],
        buttonArr[7],
        buttonArr[8]
    );

    const comps = [row1, row2, row3];

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Title")
        .setURL("https://github.com/")
        .setDescription("A description.")
        .addFields({ name: "Cool Field", value: "Penguin" })
        .setAuthor({
            name: interaction.client.user.tag,
            iconURL: interaction.client.user.displayAvatarURL(),
            url: "https://github.com/wizardassassin/WizCraftBot-1.0",
        })
        .setTimestamp()
        .setFooter({
            text: "Have a nice day!",
            iconURL: interaction.client.user.displayAvatarURL(),
        });

    const reply = await interaction.reply({
        content: "Pong!",
        embeds: [embed],
        components: comps,
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
        idle: 10000,
    });

    const board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
    const rowColDia = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    let inc = 0;

    const getTurn = () => board.filter((v) => v !== -1).length;
    const randElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const firstOpen = () => board.findIndex((v) => v === -1);
    const randOpen = () =>
        randElem(
            board.map((v, i) => (v !== -1 ? -1 : i)).filter((v) => v !== -1)
        );
    const equal = (arr, num) =>
        board[arr[0]] === num && arr.every((v) => board[v] === board[arr[0]]);
    const hasWin = (num) => {
        for (const boardRow of shuffle(rowColDia)) {
            const openSquare = boardRow.findIndex((v) => board[v] === -1);
            if (openSquare === -1) {
                continue;
            }
            const newBoardRow = boardRow.slice();
            newBoardRow.splice(openSquare, 1);
            if (equal(newBoardRow, num)) {
                return boardRow[openSquare];
            }
        }
        return -1;
    };
    const getPick = (num, lvl) => {
        if (lvl === 0) {
            return randOpen() ?? -1;
        }
        const winSquare = hasWin(num);
        if (winSquare !== -1) {
            return winSquare;
        }
        const loseSquare = hasWin(-num + 1); // 0 -> 1 | 1 -> 0
        if (loseSquare !== -1) {
            return loseSquare;
        }
        if (lvl === 1) {
            return randOpen() ?? -1;
        }
        if (board[4] === -1) {
            return 4;
        }
        const checkSquares = [];
        const midOwn = board[4];
        if (lvl === 2) {
            return randOpen() ?? -1;
        }
        if (midOwn === num) {
            checkSquares.push(...shuffle([1, 3, 5, 7]));
        } else {
            checkSquares.push(...shuffle([0, 2, 6, 8]));
        }
        for (const square of checkSquares) {
            if (board[square] === -1) {
                return square;
            }
        }
        return randOpen() ?? -1;
    };
    const wonGame = (num) => rowColDia.some((v) => equal(v, num));

    collector.on("collect", async (i) => {
        const button1 = buttonArr[Number(i.customId)];
        button1.setLabel("X");
        button1.setDisabled(true);
        button1.setStyle(ButtonStyle.Danger);
        board[i.customId] = 1;
        if (wonGame(1)) {
            collector.stop();
            await i.update({
                content: "You Win! " + ++inc,
                components: comps,
            });
            return;
        }

        const pick = getPick(0, skillLevel);
        if (pick === -1) {
            collector.stop();
            await i.update({
                content: "Tie! " + ++inc,
                components: comps,
            });
            return;
        }

        const button2 = buttonArr[pick];
        button2.setLabel("O");
        button2.setDisabled(true);
        button2.setStyle(ButtonStyle.Primary);
        board[pick] = 0;
        if (wonGame(0)) {
            collector.stop();
            await i.update({
                content: "I Win! " + ++inc,
                components: comps,
            });
            return;
        }

        await i.update({
            content: "A button was clicked! " + ++inc,
            components: comps,
        });
    });

    collector.on("end", (collected, reason) => {
        if (reason === "idle") {
            interaction.editReply("Timed Out!");
        }
        console.log(`Collected ${collected.size} items`);
    });
}
