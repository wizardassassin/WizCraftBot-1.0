import { Client, Collection, Presence } from "discord.js";
import { CronScheduler } from "./cronScheduler.js";

export async function addCronJobs(scheduler: CronScheduler) {
    const sec = 1000;
    const min = 60 * sec;
    const hour = 60 * min;
    scheduler.addJob2({ task: getPresences, interval: min, offset: 0 });
    scheduler.addJob2({ task: checkStatus, interval: hour, offset: 0 });
}

async function checkStatus(client: Client) {
    const wasReset = client.user.presence.activities.length === 0;
    await client.user.fetch();
    const wasReset2 = client.user.presence.activities.length === 0;
    if (wasReset || wasReset2) {
        console.error("Client presence was reset", wasReset, wasReset2);
        client.user.setPresence(client.storage.get("presence"));
    }
}

async function getPresences(client: Client) {
    const users = await client.prisma.user.findMany({
        where: {
            isEnabled: {
                equals: true,
            },
        },
    });
    const userPresences = new Collection<string, Set<string>>();

    for (const user of users) {
        if (!userPresences.has(user.guildId)) {
            userPresences.set(user.guildId, new Set());
        }
        userPresences.get(user.guildId).add(user.id);
    }
    for (const [guildId, userIds] of userPresences) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log("Can't find guild", guildId);
            continue;
        }
        for (const userId of userIds) {
            const presence = guild.members?.cache.get(userId)?.presence;
            if (!presence) {
                // Seems to mean that the user is offline
                // console.log("Can't find presence", userId);
                continue;
            }
            await storePresence(client, presence);
        }
    }
    await client.prisma.presence.deleteMany({
        where: {
            updatedAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 1),
            },
        },
    });
}

async function storePresence(client: Client, presence: Presence) {
    const activities = presence.activities
        .map((x) => ({
            name: x.name,
            state: x.state,
            details: x.details,
            applicationId: x.applicationId,
            timestamps: x.timestamps,
            smallImageUrl: x.assets?.smallImageURL(),
            largeImageUrl: x.assets?.largeImageURL(),
        }))
        .filter((x) => x.applicationId);
    const id = presence.userId;
    // Is there a better way to do this?
    for (const activity of activities) {
        const startTime = activity.timestamps?.start ?? new Date();
        await client.prisma.presence.upsert({
            where: {
                userId_applicationId_createdAt: {
                    userId: id,
                    applicationId: activity.applicationId,
                    createdAt: startTime,
                },
            },
            update: {
                name: activity.name,
                state: activity.state,
                details: activity.details,
                smallImageUrl: activity.smallImageUrl,
                largeImageUrl: activity.largeImageUrl,
            },
            create: {
                name: activity.name,
                state: activity.state,
                details: activity.details,
                createdAt: startTime,
                smallImageUrl: activity.smallImageUrl,
                largeImageUrl: activity.largeImageUrl,
                applicationId: activity.applicationId,
                User: {
                    connect: {
                        id: id,
                    },
                },
            },
        });
    }
}
