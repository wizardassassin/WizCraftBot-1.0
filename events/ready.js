import { ActivityType, Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

/**
 *
 * @param {import("discord.js").Client<true>} client
 */
export function execute(client) {
    client.user.setPresence({
        activities: [{ name: "Minecraft", type: ActivityType.Competing }],
        status: "online",
    });
    console.log(`Ready! Logged in as ${client.user.tag}`);
}
