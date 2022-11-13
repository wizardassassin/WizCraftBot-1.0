import { getGuildInfo } from "#utils/utils";
import { Events } from "discord.js";

export const name = Events.GuildCreate;

/**
 *
 * @param {import("discord.js").Guild} guild
 */
export async function execute(guild) {
    console.log("Server Join:");
    console.log(await getGuildInfo(guild));
}
