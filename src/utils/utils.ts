import fetch from "node-fetch";

/**
 *
 * @param {Number} ping - Time in milliseconds
 * @param {Array<Number> | number} times - Time overrides
 * @returns Attachment Object
 */
export function getPingColor(ping: number, times: Array<number> | number = -1) {
    const replyObj = {
        url: "attachment://pingColor.png",
        file: { attachment: "", name: "pingColor.png" },
    };
    const imageDir = "../images";
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
        if (ping < (time as number)) {
            // TODO: type guard?
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
function overrideArr(arr2D: Array<Array<any>>, arr1D: Array<any>, pos: number) {
    if (arr1D.length === 0) {
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
export function URLWrapper(base: string, params: { [s: string]: string }) {
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
export async function fetchWrapper(
    urlInit: import("node-fetch").RequestInfo,
    retOpt: string,
    optionsInit: import("node-fetch").RequestInit
) {
    const url = urlInit;
    const options = {};
    for (const key in optionsInit) {
        options[key] = optionsInit[key];
    }
    const res = await fetch(url, options);
    const val = await res[retOpt](); // Security risk? idk
    return val;
}

/**
 *
 * @param {Number} ms
 * @returns
 */
export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export function getIDs(message: any) {
    const regexUser = /(?<=<@!?)\d+(?=>)/g;
    const regexChannel = /(?<=<#)\d+(?=>)/g;
    const regexRole = /(?<=<@&)\d+(?=>)/g;
}

export function secondsToTimestamp(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const secondsMod = seconds % 60;
    const minutesMod = minutes % 60;

    let secondsFormat = String(secondsMod);
    secondsFormat = secondsFormat.padStart(2, "0");
    let minutesFormat = String(minutesMod);
    if (hours !== 0) {
        minutesFormat = minutesFormat.padStart(2, "0");
    }
    let retStr = `${minutesFormat}:${secondsFormat}`;
    if (hours === 0) {
        return retStr;
    }
    let hoursFormat = String(hours);
    let hLen = hoursFormat.length;
    hLen -= 3;
    while (hLen > 0) {
        hoursFormat =
            hoursFormat.slice(0, hLen) + "," + hoursFormat.slice(hLen);
        hLen -= 3;
    }
    return `${hoursFormat}:${retStr}`;
}

/**
 *
 * @param {import("discord.js").Guild} guild
 */
export async function getGuildInfo(guild: import("discord.js").Guild) {
    const owner = await guild.fetchOwner();
    return {
        name: guild.name,
        id: guild.id,
        memberCount: guild.memberCount,
        owner: owner.user.tag,
        ownerId: guild.ownerId,
        createdAt: guild.createdAt.toString(),
    };
}

/**
 *
 * @param {import("discord.js").EmbedBuilder} embed
 * @param {import("discord.js").ClientUser} user
 * @param {{url: string;file: {attachment: string;name: string;}}} pingColor
 * @param {Number} time
 * @returns
 */
export function getReplyTemplate(
    embed: import("discord.js").EmbedBuilder,
    user: import("discord.js").ClientUser,
    pingColor: { url: string; file: { attachment: string; name: string } },
    time: number = -1
) {
    const footerText = `Have a nice day!  •  ${
        time === -1 ? time : time.toFixed(4)
    }ms`;
    embed
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL(),
            url: "https://github.com/wizardassassin/WizCraftBot-1.0",
        })
        .setColor(0xf1c40f)
        .setTimestamp()
        .setFooter({
            text: footerText,
            iconURL: pingColor.url,
        });
    return {
        embeds: [embed],
        files: [pingColor.file],
    };
}
