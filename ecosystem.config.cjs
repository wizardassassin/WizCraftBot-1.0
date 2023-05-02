module.exports = {
    apps: [{
      name: "WizCraftBot 1.0",
      script: "./index.js",
      cwd: "./dist/",
      time: true,
      log: true,
      kill_timeout: 5000,
      shutdown_with_message: process.platform === "win32" // Windows
    }]
  }
