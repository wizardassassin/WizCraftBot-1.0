import { getPingColor, getReplyTemplate, URLWrapper } from "#utils/utils.js";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import { ModifiedInteraction } from "../music.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("save")
    .setDescription("Saves a playlist url.")
    .addIntegerOption((option) =>
        option
            .setName("slot")
            .setDescription(
                "The slot to save the url (max: 5, none: show saved)"
            )
            .addChoices(
                { name: "1", value: 1 },
                { name: "2", value: 2 },
                { name: "3", value: 3 },
                { name: "4", value: 4 },
                { name: "5", value: 5 }
            )
    )
    .addStringOption((option) =>
        option.setName("url").setDescription("A url to save (none to delete).")
    );

export async function execute(interaction: ModifiedInteraction) {
    const slot = interaction.options.getInteger("slot") ?? -1;
    const unparsedURL = interaction.options.getString("url") ?? "";
    const id = interaction.user.id;

    let exampleSlot = 1;

    if (slot !== -1) {
        if (unparsedURL.length !== 0) {
            exampleSlot = slot;
        }

        const isPlaylist = ytpl.validateID(unparsedURL);
        const isUrl = ytdl.validateURL(unparsedURL);
        const isID = ytdl.validateID(unparsedURL);

        let url: URL | string = "";

        if (isPlaylist) {
            const playlistID = await ytpl.getPlaylistID(unparsedURL);
            url = URLWrapper("https://www.youtube.com/playlist", {
                list: playlistID,
            });
        } else if (isUrl || isID) {
            const urlID = ytdl.getVideoID(unparsedURL);
            url = URLWrapper("https://www.youtube.com/watch", {
                v: urlID,
            });
        } else if (unparsedURL.length !== 0) {
            console.error({ slot, unparsedURL });
            await interaction.editReply(`The url could not be identified.`);
            return;
        }

        const tmpUser = await interaction.client.prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                isEnabled: true,
                playlists: true,
            },
        });

        if (!tmpUser.isEnabled) {
            await interaction.editReply("The user is disabled!");
            return;
        }

        if (tmpUser.playlists.length === 0) {
            await createPlaylists(interaction, id);
        }

        await interaction.client.prisma.playlist.update({
            where: {
                slot_userId: {
                    slot: slot,
                    userId: id,
                },
            },
            data: {
                url: url.toString(),
            },
        });
    }

    const user = await interaction.client.prisma.user.findUnique({
        where: {
            id: id,
        },
        select: {
            playlists: true,
        },
    });

    const pl = user.playlists.map((x) => `\`${x.slot}: ${x.url}\``);

    const embed = new EmbedBuilder()
        .setTitle("Playlists")
        .setDescription(pl.join("\n\n"))
        .addFields({
            name: "Example",
            value: "/music play slot: " + exampleSlot,
        });

    const reply = getReplyTemplate(
        embed,
        interaction.client.user,
        getPingColor(0),
        -1
    );

    await interaction.editReply(reply);
}

/**
 *
 * @param {string} id The id
 */
async function createPlaylists(interaction: ModifiedInteraction, id: string) {
    for (let i = 0; i < 5; i++) {
        await interaction.client.prisma.playlist.create({
            data: {
                slot: i + 1,
                url: "",
                user: {
                    connect: {
                        id: id,
                    },
                },
            },
        });
    }
}
