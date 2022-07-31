import { ActivityType } from "discord.js";

export const name = "ready";
export const once = true;

/**
 * 
 * @param {import("discord.js").Client<true>} client 
 */
export function execute(client) {
    client.user.setPresence({ activities: [{ name: 'Minecraft', type: ActivityType.Playing }], status: 'online' });
    console.log(`Ready! Logged in as ${client.user.tag}`);
}
