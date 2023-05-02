import { getGuildInfo } from "#utils/utils.js";
import { Events } from "discord.js";

export const name = Events.GuildDelete;

/**
 *
 * @param {import("discord.js").Guild} guild
 */
export async function execute(guild) {
    console.log("Server Left:");
    console.log(await getGuildInfo(guild));
}
