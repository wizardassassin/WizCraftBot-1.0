import { URLWrapper } from "#utils/utils.js";
import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    codeBlock,
} from "discord.js";
import { parse } from "node-html-parser";

export const data = new SlashCommandSubcommandBuilder()
    .setName("lyrics")
    .setDescription("Gets Song Lyrics.")
    .addStringOption((option) =>
        option
            .setName("query")
            .setDescription("Song to search for.")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("query");
    const res1 = await fetch(
        URLWrapper("https://api.genius.com/search", {
            q: query,
            access_token: process.env.GENIUS_ACCESS_TOKEN,
        })
    );
    const json = await res1.json();
    const newUrl = new URL("https://genius.com/");
    newUrl.pathname = json.response.hits[0].result.path;
    const res2 = await fetch(newUrl);
    const html = await res2.text();
    const parsed = parse(html);
    const data = parsed.querySelectorAll('[data-lyrics-container="true"]');
    // Not sure if it's platform dependant
    const text = Array.from(data, (x) => x.structuredText)
        .join("\n")
        .replace(/\n\[/g, "\n\n[");
    const newText = splitMessage(text);
    await interaction.editReply(codeBlock(newText.shift()));
    for (const t1 of newText) {
        await interaction.followUp(codeBlock(t1));
    }
}

/**
 *
 * @param {string} message
 */
export function splitMessage(message: string, limit = 1900) {
    if (message.length <= limit) {
        return [message];
    }
    const msgArr = message.split("\n\n");
    const arr = [];
    let temp = msgArr.shift();
    for (const msg of msgArr) {
        if (temp.length + msg.length < limit) {
            temp += "\n\n" + msg;
        } else {
            arr.push(temp);
            temp = msg;
        }
    }
    if (temp.length !== 0) {
        arr.push(temp);
    }
    return arr;
}
