import { getGuildInfo } from "#utils/utils.js";
import { ActivityType, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

/**
 *
 * @param {import("discord.js").Client<true>} client
 */
export async function execute(client: import("discord.js").Client<true>) {
    client.user.setPresence({
        activities: [{ name: "Minecraft", type: ActivityType.Competing }],
        status: "online",
    });

    const guilds = await Promise.all(
        (
            await client.guilds.fetch()
        ).map(async (x) => getGuildInfo(await x.fetch()))
    );
    console.log("Servers:");
    console.log(guilds);

    client.customCollectors.forEach((x) => x.start());

    console.log(`Ready! Logged in as ${client.user.tag}`);
    console.log("Date:", client.readyAt.toString());
}
