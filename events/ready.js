import { getGuildInfo } from "#utils/utils";
import { ActivityType, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

/**
 *
 * @param {import("discord.js").Client<true>} client
 */
export async function execute(client) {
    client.user.setPresence({
        activities: [{ name: "Minecraft", type: ActivityType.Competing }],
        status: "online",
    });

    console.log(`Ready! Logged in as ${client.user.tag}`);
    console.log("Date:", client.readyAt.toString());

    const guilds = await Promise.all(
        (
            await client.guilds.fetch()
        ).map(async (x) => getGuildInfo(await x.fetch()))
    );
    console.log("Servers:");
    console.log(guilds);
}
