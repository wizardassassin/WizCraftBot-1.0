import { getGuildInfo } from "#utils/utils.js";
import { Events } from "discord.js";

export const name = Events.GuildCreate;

/**
 *
 * @param {import("discord.js").Guild} guild
 */
export async function execute(guild: import("discord.js").Guild) {
    console.log("Server Join:");
    console.log(await getGuildInfo(guild));
}
