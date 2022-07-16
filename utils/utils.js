import { performance } from "perf_hooks";
import fetch from "node-fetch";

import * as self from "#utils/utils";
export default self;

/**
 *
 * @param {Number} ping - Time in milliseconds
 * @param {Array<Number> | number} times - Time overrides
 * @returns Attachment Object
 */
export function getPingColor(ping, times) {
    const replyObj = {
        url: "attachment://pingColor.png",
        file: { attachment: "", name: "pingColor.png" },
    };
    const imageDir = "./images";
    const key = [
        [90, "Green_Square.png"],
        [160, "Yellow_Square.png"],
        [200, "Orange_Square.png"],
        [Infinity, "Red_Square.png"],
    ];

    switch (times) {
        case 1:
            overrideArr(key, [250, 500, 1000], 0);
            break;
        case 2:
            overrideArr(key, [500, 1000, 2000], 0);
            break;
        default:
            if (Array.isArray(times)) {
                overrideArr(key, times, 0);
            }
            break;
    }

    for (const [time, file] of key) {
        if (ping < time) {
            replyObj.file.attachment = `${imageDir}/${file}`;
            return replyObj;
        }
    }
    replyObj.file.attachment = `${imageDir}/${key[key.length - 1][1]}`;
    return replyObj;
}

/**
 *
 * @param {Array<Array>} arr2D
 * @param {Array} arr1D
 * @param {Number} pos
 */
function overrideArr(arr2D, arr1D, pos) {
    if (arr1D.length == 0) {
        return;
    }
    const len = Math.min(arr1D.length, arr2D.length);
    for (let i = 0; i < len; i++) {
        arr2D[i][pos] = arr1D[i];
    }
}

/**
 *
 * @param {string} base
 * @param {Object.<string,string>} params
 * @returns
 */
export function URLWrapper(base, params) {
    const url = new URL(base);
    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }
    return url;
}

/**
 * Kind of useless atm
 *
 * @param {import("node-fetch").RequestInfo} urlInit
 * @param {string} retOpt
 * @param {import("node-fetch").RequestInit} optionsInit
 */
export async function fetchWrapper(urlInit, retOpt, optionsInit) {
    const url = urlInit;
    const options = {};
    for (const key in optionsInit) {
        options[key] = optionsInit[key];
    }
    const res = await fetch(url, options);
    const val = await res[retOpt](); // Security risk? idk
    return val;
}

export class Timer {
    startTime;
    stopTime;
    constructor() {
        this.startTime = 0;
        this.stopTime = 0;
        this.start();
        this.stop();
    }
    start() {
        this.startTime = performance.now();
    }
    stop() {
        this.stopTime = performance.now();
    }
    duration(m) {
        return this.stopTime - this.startTime;
    }
}

/**
 *
 * @param {Number} ms
 * @returns
 */
export function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

export function getIDs(message) {
    const regexUser = /(?<=<@!?)\d+(?=>)/g;
    const regexChannel = /(?<=<#)\d+(?=>)/g;
    const regexRole = /(?<=<@&)\d+(?=>)/g;
}
