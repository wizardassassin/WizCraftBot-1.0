export const name = "ready";
export const once = true;
export function execute(client) {
    client.user.setPresence({ activities: [{ name: 'activity' }], status: 'idle' });
    console.log(`Ready! Logged in as ${client.user.tag}`);
}
