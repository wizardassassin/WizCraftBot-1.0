import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { createCanvas, loadImage } from "canvas";
import { Chess, PieceSymbol, Color } from "chess.js";

export const data = new SlashCommandBuilder()
    .setName("chess")
    .setDescription("Starts a chess game!");

const imageDir = "../images/chess/";

const images = [
    "Chess_d80.png",
    "Chess_l80.png",
    "Chess_bdt80.png",
    "Chess_blt80.png",
    "Chess_kdt80.png",
    "Chess_klt80.png",
    "Chess_ndt80.png",
    "Chess_nlt80.png",
    "Chess_pdt80.png",
    "Chess_plt80.png",
    "Chess_qdt80.png",
    "Chess_qlt80.png",
    "Chess_rdt80.png",
    "Chess_rlt80.png",
].map((x) => `${imageDir}${x}`);

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const size = 640;
    const squares = 8;
    const squareSize = size / squares;

    const [darkSquare, lightSquare, ...pieces] = await Promise.all(
        images.map((x) => loadImage(x))
    );

    const getPiece = (type: PieceSymbol, color: Color) => {
        let val: number;
        switch (type) {
            case "b":
                val = 0;
                break;
            case "k":
                val = 2;
                break;
            case "n":
                val = 4;
                break;
            case "p":
                val = 6;
                break;
            case "q":
                val = 8;
                break;
            case "r":
                val = 10;
                break;
        }
        if (color === "w") val++;
        return pieces[val];
    };

    const chess = new Chess();

    const getBoardImage = (reverseBoard: boolean) => {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext("2d");
        const board = chess.board();
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

        if (reverseBoard) {
            board.reverse();
            letters.reverse();
            numbers.reverse();
        }

        let isLight = true;
        for (let i = 0; i < squares; i++) {
            for (let j = 0; j < squares; j++) {
                const piece = board[i][j];
                const x = j * squareSize;
                const y = i * squareSize;
                ctx.drawImage(isLight ? lightSquare : darkSquare, x, y);
                if (piece)
                    ctx.drawImage(getPiece(piece.type, piece.color), x, y);
                isLight = !isLight;
            }
            isLight = !isLight;
        }

        ctx.font = "bold 20px 'Noto Sans'";

        const hexLight = "#ffce9e";
        const hexDark = "#d28c45";

        const hexLight2 = "#f0d9b5";
        const hexDark2 = "#b58863";

        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        isLight = true;
        for (let j = 0; j < squares; j++) {
            ctx.fillStyle = isLight ? hexLight : hexDark;
            ctx.fillText(letters[j], 4 + j * squareSize, size);
            isLight = !isLight;
        }

        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        isLight = true;
        for (let i = 0; i < squares; i++) {
            ctx.fillStyle = isLight ? hexLight : hexDark;
            ctx.fillText(
                numbers[squares - 1 - i],
                size - 1,
                1 + i * squareSize
            );
            isLight = !isLight;
        }

        return canvas.toBuffer("image/png");
    };

    const createRow = () => {
        const moves = chess
            .moves()
            .map((x) =>
                new StringSelectMenuOptionBuilder().setLabel(x).setValue(x)
            );
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("move")
            .setPlaceholder("Make a move!")
            .addOptions(...moves);
        const row =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                selectMenu
            );
        return row;
    };

    let reverseBoard = false;

    const reply = await interaction.editReply({
        content: "",
        files: [
            {
                name: "board.png",
                attachment: getBoardImage(reverseBoard),
            },
        ],
        components: [createRow()],
    });

    interaction.client.componentCollectors.set(reply.id, interaction.user.id);

    const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        idle: 60000,
    });

    collector.on("collect", async (res: StringSelectMenuInteraction) => {
        chess.move(res.values[0]);
        reverseBoard = !reverseBoard;
        await res.update({
            content: "",
            files: [
                {
                    name: "board.png",
                    attachment: getBoardImage(reverseBoard),
                },
            ],
            components: [createRow()],
        });
    });

    collector.on("end", (collected) => {
        console.log(`Collected ${collected.size} items`);
        interaction.client.componentCollectors.delete(reply.id);
    });
}
