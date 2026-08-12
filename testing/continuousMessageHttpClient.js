// HTTP Client: Send continuous messages using REST API
// Alternative to Socket.IO if you prefer HTTP requests

const axios = require("axios");

class ContinuousMessageHttpClient {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
    this.messageCount = 0;
    this.sendInterval = null;
    this.isRunning = false;
  }

  // Start sending messages continuously
  async start(intervalMs = 5000) {
    if (this.isRunning) {
      console.log("Message sender already running");
      return;
    }

    this.isRunning = true;
    console.log(`Starting to send messages every ${intervalMs}ms`);

    this.sendInterval = setInterval(async () => {
      this.messageCount++;

      const message = {
        id: this.messageCount,
        text: `HTTP Message #${this.messageCount} - ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        temperature: Math.random() * 100,
        humidity: Math.random() * 100,
        location: {
          latitude: 40.7128 + Math.random() * 0.1,
          longitude: -74.006 + Math.random() * 0.1,
        },
        deviceId: `6a50877fff28342749bd3088`,
      };

      try {
        const response = await axios.post(`${this.baseURL}/livedata`, message, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        console.log(
          `[${new Date().toLocaleTimeString()}] Message ${this.messageCount} sent - Status: ${response.status}`,
        );
      } catch (error) {
        console.error(
          `Error sending message ${this.messageCount}:`,
          error.message,
        );

        // Retry logic (optional)
        if (error.response?.status !== 400) {
          console.log("Retrying in 3 seconds...");
        }
      }
    }, intervalMs);
  }

  // Stop sending messages
  stop() {
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.isRunning = false;
      console.log("Message sender stopped");
    }
  }

  // Change sending interval
  setInterval(intervalMs) {
    this.stop();
    this.start(intervalMs);
  }

  // Get current message count
  getMessageCount() {
    return this.messageCount;
  }

  // Send a single message
  async sendSingle(customMessage = {}) {
    this.messageCount++;

    const message = {
      id: this.messageCount,
      text: customMessage.text || `Message #${this.messageCount}`,
      timestamp: new Date(),
      ...customMessage,
    };

    try {
      const response = await axios.post(`${this.baseURL}/livedata`, message);

      console.log("Message sent successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error.message);
      throw error;
    }
  }

  // Check server status
  async checkStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/livedata`);

      console.log("Server status:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error checking status:", error.message);
      throw error;
    }
  }
}

// Example usage
if (require.main === module) {
  const client = new ContinuousMessageHttpClient("http://localhost:3000");

  // Start sending messages every 5 seconds
  client.start(5000);

  // Example: Stop after 30 seconds
  setTimeout(() => {
    client.stop();
    console.log(`Total messages sent: ${client.getMessageCount()}`);
  }, 30000);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    client.stop();
    process.exit(0);
  });
}

module.exports = ContinuousMessageHttpClient;
