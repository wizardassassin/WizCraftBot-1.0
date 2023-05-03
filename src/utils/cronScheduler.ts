import { Client } from "discord.js";
import { Timer } from "./timer.js";

export type taskType = (client: Client<true>) => Promise<void>;

export type jobObj = {
    task: taskType;
    interval: number;
    offset: number;
};

export class CronDelay {
    #interval: number;
    #offset: number;
    constructor(interval: number, offset: number) {
        this.#interval = interval;
        this.#offset = offset;
    }

    getDelay() {
        const date = new Date().getTime();
        const date2 =
            Math.round(date / (this.#interval / 10)) * (this.#interval / 10);
        const newTime = Math.floor(date2 / this.#interval) * this.#interval;
        const startTime = newTime + this.#interval + this.#offset;
        return startTime - date;
    }
}

export class CronJob {
    #task: taskType;
    #delay: CronDelay;
    #timer: Timer;
    #timeout: NodeJS.Timeout;
    timeoutPromise: Promise<number>;
    #promiseRes: (value: number | PromiseLike<number>) => void;
    #shouldStop: boolean;
    #isRunning: boolean;
    #isActive: boolean;
    #client: Client<true>;
    nextRun: Date;

    constructor(task: taskType, delay: CronDelay) {
        this.#task = task;
        this.#delay = delay;
        this.#timer = new Timer();
        this.#isRunning = false;
        this.#isActive = false;
        this.#shouldStop = false;
    }

    async #run() {
        if (this.#isRunning) {
            console.error("Already Running.");
            return;
        }
        let didError = false;
        this.#isRunning = true;
        this.#timer.start();
        try {
            await this.#task(this.#client);
        } catch (error) {
            console.error(error);
            didError = true;
        }
        this.#timer.stop();
        this.#isRunning = false;
        return didError;
    }

    #queueJob() {
        const nextDelay = this.#delay.getDelay();
        this.nextRun = new Date(Date.now() + nextDelay);
        this.timeoutPromise = new Promise((res, _rej) => {
            this.#promiseRes = res;
            this.#timeout = setTimeout(async () => {
                const didError = await this.#run();
                res(Number(didError));
                if (this.#shouldStop) {
                    return;
                }
                this.#queueJob();
            }, nextDelay);
        });
    }

    setClient(client: Client<true>) {
        this.#client = client;
    }

    start() {
        if (this.#isActive) {
            console.error("Already started.");
            return;
        }
        this.#isActive = true;
        this.#queueJob();
    }

    async stop() {
        if (this.#shouldStop) {
            console.error("Already stopping.");
            return;
        }
        this.#shouldStop = true;
        clearInterval(this.#timeout);
        if (this.#isRunning) {
            console.log("Waiting for job to complete.");
            await this.timeoutPromise;
        }
        this.#promiseRes(2);
        this.#shouldStop = false;
        this.#isActive = false;
    }
}

export class CronScheduler {
    #jobs: Array<CronJob>;
    #client: Client;

    constructor(client: Client) {
        this.#jobs = [];
        this.#client = client;
    }

    addJob(job: CronJob) {
        this.#jobs.push(job);
    }

    addJob2(obj: jobObj) {
        const delay = new CronDelay(obj.interval, obj.offset);
        const job = new CronJob(obj.task, delay);
        this.addJob(job);
    }

    start() {
        if (!this.#client.isReady()) {
            console.error("Client isn't ready!");
            return;
        }
        this.#jobs.forEach((x) => {
            x.setClient(this.#client);
            x.start();
        });
    }

    async stop() {
        await Promise.all(this.#jobs.map((x) => x.stop()));
    }
}
