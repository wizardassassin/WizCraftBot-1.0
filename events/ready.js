export const name = "ready";
export const once = true;

/**
 * 
 * @param {import("discord.js").Client<true>} client 
 */
export function execute(client) {
    client.user.setPresence({ activities: [{ name: 'Minecraft' }], status: 'online' });
    console.log(`Ready! Logged in as ${client.user.tag}`);
}
