export default {};

/**
 *
 * @param {Number} ping - Time in milliseconds
 * @returns Attachment Object
 */
export function getPingColor(ping) {
    const imageDir = "./images";
    const key = [
        [90, "Green_Square.png"],
        [160, "Yellow_Square.png"],
        [200, "Orange_Square.png"],
        [Infinity, "Red_Square.png"],
    ];
    for (const [time, file] of key) {
        if (ping < time) {
            return { attachment: `${imageDir}/${file}`, name: "pingColor.png" };
        }
    }
    return {
        attachment: `${imageDir}/${key[key.length - 1][1]}`,
        name: "pingColor.png",
    };
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

export function fetchWrapper(url) {}
