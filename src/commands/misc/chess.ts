import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { createCanvas, loadImage } from "canvas";
import { Chess, PieceSymbol, Color, Square } from "chess.js";

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

const fontPath = `${imageDir}NotoSans-Regular.ttf`;

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
            board.forEach((x) => x.reverse());
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

        ctx.font = 'bold 20px "Noto Sans"';

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

    const toPiece = (piece: PieceSymbol) => {
        switch (piece) {
            case "b":
                return "Bishop";
            case "p":
                return "Pawn";
            case "n":
                return "Knight";
            case "r":
                return "Rook";
            case "q":
                return "Queen";
            case "k":
                return "King";
        }
    };

    const createPieceRow = (cache: string = null) => {
        const moves = chess.moves({ verbose: true });
        const squares = new Set<string>();

        const pieces = moves
            .filter((x) => {
                if (squares.has(x.from)) return false;
                squares.add(x.from);
                return true;
            })
            .map((x) => {
                const squareName = x.from;
                const pieceName = toPiece(x.piece);
                const option = new StringSelectMenuOptionBuilder()
                    .setLabel(`${pieceName} (${squareName})`)
                    .setValue(squareName);
                if (cache === squareName) option.setDefault(true);
                return option;
            });
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("piece")
            .setPlaceholder("Choose a piece!")
            .addOptions(...pieces);
        const row =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                selectMenu
            );
        return row;
    };

    const createMoveRow = (square: string = null) => {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("move")
            .setPlaceholder("Make a move!");
        const row =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                selectMenu
            );
        if (!square) {
            selectMenu
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("NULL")
                        .setValue("NULL")
                )
                .setDisabled(true);
            return row;
        }
        const moves = chess.moves({ verbose: true, square: square as Square });
        selectMenu.addOptions(
            ...moves.map((x) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${x.to} (${x.san})`)
                    .setValue(x.san)
            )
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
        components: [createPieceRow(), createMoveRow()],
    });

    interaction.client.componentCollectors.set(reply.id, interaction.user.id);

    const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        idle: 60000 * 2,
    });

    collector.on("collect", async (res: StringSelectMenuInteraction) => {
        if (res.customId === "piece") {
            await res.update({
                content: "",
                components: [
                    createPieceRow(res.values[0]),
                    createMoveRow(res.values[0]),
                ],
            });
        }
        if (res.customId !== "move") return;
        chess.move(res.values[0]);
        if (chess.isGameOver()) {
            const winMessage = chess.isDraw()
                ? "Draw!"
                : chess.turn() === "b"
                ? "White Wins!"
                : "Black Wins!";
            await res.update({
                content: winMessage,
                files: [
                    {
                        name: "board.png",
                        attachment: getBoardImage(reverseBoard),
                    },
                    {
                        name: "pgn.txt",
                        attachment: Buffer.from(chess.pgn()),
                    },
                ],
                components: [],
            });
            collector.stop();
            return;
        }
        reverseBoard = !reverseBoard;
        await res.update({
            content: "",
            files: [
                {
                    name: "board.png",
                    attachment: getBoardImage(reverseBoard),
                },
            ],
            components: [createPieceRow(), createMoveRow()],
        });
    });

    collector.on("end", (collected) => {
        console.log(`Collected ${collected.size} items`);
        interaction.client.componentCollectors.delete(reply.id);
    });
}
