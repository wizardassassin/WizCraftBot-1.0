import { getGuildInfo } from "#utils/utils.js";
import { Events, Guild } from "discord.js";

export const name = Events.GuildCreate;

export async function execute(guild: Guild) {
    console.log("Server Join:");
    console.log(await getGuildInfo(guild));
}
