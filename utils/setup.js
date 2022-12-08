import { customCollectors } from "#utils/collectors";

let pushedOnce = false;

export const hasPushed = () => pushedOnce;
export const setPushed = (val) => (pushedOnce = val);

export function importExitHandler() {
    // Linux
    // Also trigged with Ctrl+C in windows
    process.on("SIGINT", (code) => {
        handleUserExit(code);
    });

    // Windows
    process.on("message", function (msg) {
        // Loose equals
        if (msg == "shutdown") {
            handleUserExit(msg);
        }
    });

    process.on("SIGTERM", (code) => {
        handleUserExit(code);
    });
}

export async function handleUserExit(signal) {
    console.log({ Received: signal });
    if (pushedOnce) {
        console.log("Forcefully shutting down...");
        process.exit(1);
    }
    pushedOnce = true;
    console.log("Received Ctrl+C, gracefully shutting down...");
    console.log("Press Ctrl+C again to forcefully shutdown.");
    await Promise.all(customCollectors.map(async (x) => await x.stop()));
    process.exit(0);
}
