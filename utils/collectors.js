import { Collection } from "discord.js";
import prisma from "#utils/db";

export const customCollectors = new Collection();

export const minToMs = 60000;

/**
 *
 * @param {import("discord.js").Client} client
 */
export function importCustomCollectors(client) {
    const collector = createTimeoutWrapper(
        () => startPresenceCollector(client),
        minToMs * 1,
        "Presence Collector",
        true
    );
    customCollectors.set("Presence Collector", collector);
}

/**
 *
 * @param {import("discord.js").Client} client
 */
async function startPresenceCollector(client) {
    const users = await prisma.user.findMany({
        where: {
            isEnabled: {
                equals: true,
            },
        },
    });
    const userPresences = new Collection();

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
                console.log("Can't find presence", userId);
                continue;
            }
            await storePresence(presence);
        }
    }
    await prisma.presence.deleteMany({
        where: {
            updatedAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 1),
            },
        },
    });
}

/**
 *
 * @param {import("discord.js").Presence} presence
 */
async function storePresence(presence) {
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
        await prisma.presence.upsert({
            where: {
                userId_applicationId_createdAt: {
                    userId: id,
                    applicationId: activity.applicationId,
                    createdAt: activity.timestamps.start,
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
                createdAt: activity.timestamps.start,
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

// this
export const createTimeout = (
    collectorWrapper,
    getInterval,
    name,
    runOnReady = false
) => ({
    isRunning: null,
    nextRun: null,
    _timeout: null,
    _stopRunning: null,
    _promise: null,
    _res: null,
    _rej: null,
    start() {
        const workerCallback = async () => {
            console.log("Started", name);
            console.time(name);
            this.isRunning = true;
            try {
                await collectorWrapper();
            } catch (error) {
                console.error(error);
            }
            this.isRunning = false;
            console.timeEnd(name);
            if (this._stopRunning) {
                console.log("Stopped", name);
                this._res("Done");
                return;
            }
            const waitTime = getInterval();
            this.nextRun = new Date(Date.now() + waitTime);
            this._timeout = setTimeout(workerCallback, waitTime);
        };
        this._promise = new Promise((res, rej) => {
            this._res = res;
            this.rej = rej;
        });
        if (runOnReady) {
            workerCallback();
            return;
        }
        const waitTime = getInterval();
        this.nextRun = new Date(Date.now() + waitTime);
        this._timeout = setTimeout(workerCallback, waitTime);
        this.nextRun;
    },
    async stop() {
        this._stopRunning = true;
        clearInterval(this._timeout);
        if (!this.isRunning) {
            console.log("Stopped", name);
            return;
        }
        console.log("Waiting for", name, "to finish...");
        await this._promise;
    },
});

export const createTimeoutWrapper = (
    collectorWrapper,
    interval,
    name,
    runOnReady = false
) => createTimeout(collectorWrapper, () => interval, name, runOnReady);

export const createClockTimeoutWrapper = (
    collectorWrapper,
    interval,
    name,
    runOnReady = false,
    startTime = Date.now()
) =>
    createTimeout(
        collectorWrapper,
        () => interval - ((Date.now() - startTime) % interval),
        name,
        runOnReady
    );
