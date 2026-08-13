/**
 * Continuous LiveData POST Sender
 *
 * Sends continuous POST requests to /livedata endpoint
 * Similar to the Socket.IO continuous client, but using HTTP POST
 */

const axios = require("axios");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const LIVEDATA_ENDPOINT = `${SERVER_URL}/livedata`;

console.log("🔧 Initializing LiveData POST Sender\n");
console.log("Endpoint:", LIVEDATA_ENDPOINT);
console.log("================================\n");

let messageCount = 0;
let sendInterval = null;
let isRunning = false;

class LiveDataPostSender {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
    this.endpoint = `${baseURL}/livedata`;
    this.messageCount = 0;
    this.sendInterval = null;
    this.isRunning = false;
  }

  // Start sending data continuously
  start(intervalMs = 5000) {
    if (this.isRunning) {
      console.log("⚠️  Sender already running");
      return;
    }

    this.isRunning = true;
    console.log(`📤 Starting to send POST requests every ${intervalMs}ms`);
    console.log(`   Format: [TIME] 📨 POST #N → Location data\n`);

    this.sendInterval = setInterval(async () => {
      this.messageCount++;

      const data = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
        transmitid: `device-${Math.floor(Math.random() * 100)}`,
        deviceId: "6a50877fff28342749bd3088",
        temperature: Math.random() * 100,
        humidity: Math.random() * 100,
        timestamp: new Date(),
      };

      try {
        console.log(
          `[${new Date().toLocaleTimeString()}] 📤 POST #${this.messageCount} sending:`,
        );
        console.log(JSON.stringify(data, null, 2));

        const response = await axios.post(this.endpoint, data, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        });

        console.log(
          `[${new Date().toLocaleTimeString()}] 📨 POST #${this.messageCount} → Server: ${response.status}`,
        );

        if (response.data.success) {
          console.log(
            `                     ✅ Received - Lat: ${data.latitude.toFixed(4)}, Lng: ${data.longitude.toFixed(4)}`,
          );
        }
      } catch (error) {
        console.error(
          `[${new Date().toLocaleTimeString()}] ❌ POST #${this.messageCount} failed:`,
          error.message,
        );

        if (error.response) {
          console.error(
            `                     Status: ${error.response.status} - ${error.response.data?.message}`,
          );
        }
      }
    }, intervalMs);
  }

  // Stop sending
  stop() {
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.isRunning = false;
      console.log("\n⏹️  Sender stopped");
      console.log(`📊 Total requests sent: ${this.messageCount}`);
    }
  }

  // Change interval
  setInterval(intervalMs) {
    this.stop();
    setTimeout(() => {
      this.start(intervalMs);
    }, 100);
  }

  // Send single request
  async sendSingle(customData = {}) {
    this.messageCount++;

    const data = {
      latitude: 40.7128,
      longitude: -74.006,
      transmitid: "test-device",
      deviceId: "device-main",
      temperature: Math.random() * 100,
      humidity: Math.random() * 100,
      timestamp: new Date(),
      ...customData,
    };

    try {
      console.log("📤 Sending single POST request...");
      console.log("Request body:");
      console.log(JSON.stringify(data, null, 2));

      const response = await axios.post(this.endpoint, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Request successful!");
      console.log("Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Request failed:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  // Get status
  getStatus() {
    return {
      running: this.isRunning,
      messagesSent: this.messageCount,
      endpoint: this.endpoint,
      timestamp: new Date(),
    };
  }
}

// Example usage if run directly
if (require.main === module) {
  const sender = new LiveDataPostSender(SERVER_URL);

  // Start sending every 5 seconds
  sender.start(5000);

  // Stop after 30 seconds (for testing)
  // setTimeout(() => {
  //   sender.stop();
  //   console.log("\nTest completed!");
  //   process.exit(0);
  // }, 30000);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down...");
    sender.stop();
    process.exit(0);
  });

  console.log("Press Ctrl+C to stop\n");
}

module.exports = LiveDataPostSender;
