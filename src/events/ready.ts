import { getGuildInfo } from "#utils/utils.js";
import { Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

/**
 *
 * @param {import("discord.js").Client<true>} client
 */
export async function execute(client: import("discord.js").Client<true>) {
    // client.user.setPresence(client.storage.get("presence"));

    const guilds = await Promise.all(
        (
            await client.guilds.fetch()
        ).map(async (x) => getGuildInfo(await x.fetch()))
    );
    console.log("Servers:");
    console.log(guilds);

    client.cronScheduler.start();

    console.log(`Ready! Logged in as ${client.user.tag}`);
}
