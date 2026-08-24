const Device = require("../db/deviceinfo.js");

const DEFAULT_THRESHOLD_MINUTES = 10;
const CHECK_INTERVAL_MS = 60 * 1000; // check once a minute

// Periodically marks devices "offline" once no GPS update has been received for longer than the configured threshold.
function startDeviceOfflineMonitor() {
  const thresholdMinutes =
    parseInt(process.env.DEVICE_OFFLINE_THRESHOLD_MINUTES, 10) ||
    DEFAULT_THRESHOLD_MINUTES;

  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - thresholdMinutes * 60 * 1000);
      const result = await Device.updateMany(
        {
          lastSeenAt: { $lt: cutoff },
          status: { $nin: ["offline", "lost", "maintenance"] },
        },
        { $set: { status: "offline" } },
      );

      if (result.modifiedCount > 0) {
        console.log(
          `Device offline monitor: marked ${result.modifiedCount} device(s) offline (no GPS for ${thresholdMinutes}m).`,
        );
      }
    } catch (error) {
      console.error("Device offline monitor error:", error.message);
    }
  }, CHECK_INTERVAL_MS);
}

module.exports = { startDeviceOfflineMonitor };
