import { getGuildInfo } from "#utils/utils.js";
import { Events, Guild } from "discord.js";

export const name = Events.GuildDelete;

export async function execute(guild: Guild) {
    console.log("Server Left:");
    console.log(await getGuildInfo(guild));
}
