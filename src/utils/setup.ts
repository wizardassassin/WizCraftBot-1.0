let pushedOnce = false;

const events: Array<() => Promise<void>> = [];

export function addExitEvent(stopEvent: () => Promise<void>) {
    events.push(stopEvent);
}

export function importExitHandler() {
    // Linux
    // Also trigged with Ctrl+C in windows
    process.on("SIGINT", (code) => {
        handleUserExit(code);
    });

    // Windows
    if (process.platform === "win32") {
        process.on("message", function (msg) {
            // Loose equals
            if (msg == "shutdown") {
                handleUserExit(String(msg));
            }
        });
    }

    process.on("SIGTERM", (code) => {
        handleUserExit(code);
    });
}

export async function handleUserExit(signal: NodeJS.Signals | string) {
    console.log({ Received: signal });
    if (pushedOnce) {
        console.log("Forcefully shutting down...");
        process.exit(1);
    }
    pushedOnce = true;
    console.log("Received Ctrl+C, gracefully shutting down...");
    console.log("Press Ctrl+C again to forcefully shutdown.");
    await Promise.all(events.map((event) => event()));
    process.exit(0);
}
