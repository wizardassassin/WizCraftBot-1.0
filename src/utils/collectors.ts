import { Collection } from "discord.js";
import prisma from "#utils/db.js";

export const customCollectors = new Collection<string, TimeoutObj>();

export const minToMs = 60000;

/**
 *
 * @param {import("discord.js").Client} client
 */
export function importCustomCollectors(client: import("discord.js").Client) {
    const collector = createTimeoutWrapper({
        collectorWrapper: function () {
            return startPresenceCollector.call(this, client);
        },
        interval: minToMs * 1,
        name: "Presence Collector",
        runOnReady: true,
    });
    customCollectors.set("Presence Collector", collector);
}

/**
 *
 * @param {import("discord.js").Client} client
 */
async function startPresenceCollector(client: import("discord.js").Client) {
    const users = await prisma.user.findMany({
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
async function storePresence(presence: import("discord.js").Presence) {
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
        await prisma.presence.upsert({
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

/**
 * @typedef {Object} BaseTimeoutInput
 * @property {() => Promise<void>} collectorWrapper Should bind to this (not an arrow function)
 * @property {string} name
 * @property {boolean?} runOnReady
 * @property {number?} loggingLevel
 */

type BaseTimeoutInput = {
    collectorWrapper: () => Promise<void>;
    name: string;
    runOnReady?: boolean;
    loggingLevel?: number;
};

/**
 * @typedef {Object} TimeoutObj
 * @property {boolean} isRunning
 * @property {Date} nextRun
 * @property {NodeJS.Timeout} _timeout
 * @property {boolean} _stopRunning
 * @property {Promise<unknown>} _promise
 * @property {() => Promise<void>} _collectorWrapper Binds to this
 * @property {(value: unknown) => void} _res
 * @property {(value: unknown) => void} _rej
 * @property {() => void} start  Binds to this
 * @property {() => Promise<unknown>} stop Binds to this
 * @property {(logWrapper: () => void, logLevel: number) => void} log Binds to this
 *
 */

type TimeoutObj = {
    isRunning: boolean;
    nextRun: Date;
    _timeout: NodeJS.Timeout;
    _stopRunning: boolean;
    _promise: Promise<unknown>;
    _collectorWrapper: () => Promise<void>;
    _res: (value: unknown) => void;
    _rej: (value: unknown) => void;
    start: () => void;
    stop: () => Promise<unknown>;
    log: (logWrapper: () => void, logLevel: number) => void;
};

/**
 *
 * @param {BaseTimeoutInput & {getInterval: () => number}} param0
 * @returns {TimeoutObj}
 */
export const createTimeout = ({
    collectorWrapper,
    getInterval,
    name,
    runOnReady = false,
    loggingLevel = 1,
}: BaseTimeoutInput & { getInterval: () => number }): TimeoutObj => ({
    isRunning: null,
    nextRun: null,
    _timeout: null,
    _stopRunning: null,
    _promise: null,
    _res: null,
    _rej: null,
    _collectorWrapper: collectorWrapper, // this
    start() {
        this.log(() => console.log("Starting", name), 3);
        const workerCallback = async () => {
            this.log(() => console.log("Started", name), 3);
            this.log(() => console.time(name), 3);
            this.isRunning = true;
            try {
                await this._collectorWrapper();
            } catch (error) {
                console.error(error);
            }
            this.isRunning = false;
            this.log(() => console.timeEnd(name), 3);
            if (this._stopRunning) {
                this.log(() => console.log("Stopped", name), 1);
                this._res("Done");
                return;
            }
            const waitTime = getInterval();
            this.nextRun = new Date(Date.now() + waitTime);
            this._timeout = setTimeout(workerCallback, waitTime);
            this.log(() => console.log(`Next ${name}:`, this.nextRun), 3);
        };
        this._promise = new Promise((res, rej) => {
            this._res = res;
            this.rej = rej;
        });
        if (runOnReady) {
            this.log(() => console.log(`First ${name} in`, 0, "seconds"), 1);
            this.log(() => console.log(`First ${name}:`, new Date()), 1);
            workerCallback();
            return;
        }
        const waitTime = getInterval();
        this.nextRun = new Date(Date.now() + waitTime);
        this._timeout = setTimeout(workerCallback, waitTime);
        this.log(
            () => console.log(`First ${name} in`, waitTime / 1000, "seconds"),
            1
        );
        this.log(() => console.log(`First ${name}:`, this.nextRun), 1);
    },
    async stop() {
        this.log(() => console.log("Stopping", name), 3);
        this._stopRunning = true;
        clearInterval(this._timeout);
        if (!this.isRunning) {
            this.log(() => console.log("Stopped", name), 1);
            return;
        }
        this.log(() => console.log("Waiting for", name, "to finish..."), 1);
        await this._promise;
    },
    log(logWrapper, logLevel) {
        if (logLevel <= loggingLevel) {
            logWrapper();
        }
    },
});

/**
 *
 * @param {BaseTimeoutInput & { interval: number; }} param0
 * @returns {ReturnType<typeof createTimeout>}
 */
export const createTimeoutWrapper = ({
    collectorWrapper,
    interval,
    name,
    runOnReady = false,
    loggingLevel = 1,
}: BaseTimeoutInput & { interval: number }): ReturnType<typeof createTimeout> =>
    createTimeout({
        collectorWrapper,
        getInterval: () => interval,
        name,
        runOnReady,
        loggingLevel,
    });

/**
 *
 * @param {BaseTimeoutInput & { interval: number; startTime?: number; } } param0
 * @returns {ReturnType<typeof createTimeout>}
 */
export const createClockTimeoutWrapper = ({
    collectorWrapper,
    interval,
    name,
    runOnReady = false,
    loggingLevel = 1,
    startTime = Date.now(),
}: BaseTimeoutInput & { interval: number; startTime?: number }): ReturnType<
    typeof createTimeout
> =>
    createTimeout({
        collectorWrapper,
        getInterval: () => interval - ((Date.now() - startTime) % interval),
        name,
        runOnReady,
        loggingLevel,
    });
