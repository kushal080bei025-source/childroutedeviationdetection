// Client-side: Continuously send messages to backend
// Run this file separately or integrate into your frontend

const io = require("socket.io-client");

// Configuration
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const RECONNECT_DELAY = 1000;
const RECONNECT_MAX_DELAY = 5000;
const RECONNECT_ATTEMPTS = Infinity; // Retry indefinitely

console.log("🔧 Connecting to server:", SERVER_URL);
console.log("📡 Waiting for connection...\n");

// Connect to your backend server with improved config
const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionDelay: RECONNECT_DELAY,
  reconnectionDelayMax: RECONNECT_MAX_DELAY,
  reconnectionAttempts: RECONNECT_ATTEMPTS,
  transports: ["websocket", "polling"],
  forceNew: false,
  secure: SERVER_URL.startsWith("https"),
});

// Variables to control the message sending
let messageCount = 0;
let isConnected = false;
let sendInterval = null;

// Handle connection
socket.on("connect", () => {
  console.log("✅ Connected to server");
  console.log("📱 Socket ID:", socket.id);
  console.log("🚀 Transport:", socket.io.engine.transport.name);
  isConnected = true;
  startSendingMessages();
});

// Handle disconnection
socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected from server");
  console.log("📌 Reason:", reason);
  isConnected = false;
  if (sendInterval) {
    clearInterval(sendInterval);
  }
});

// Handle connection errors
socket.on("connect_error", (error) => {
  console.error("⚠️  Connection error:");
  console.error("   Message:", error.message);
  console.error("   Type:", error.type);
  console.error("   Full error:", error);
});

// Handle transport errors
socket.on("error", (error) => {
  console.error("🔴 Socket error:", error);
});

// Handle reconnection attempt
socket.on("reconnect_attempt", () => {
  console.log("🔄 Attempting to reconnect...");
});

// Handle successful reconnection
socket.on("reconnect", () => {
  console.log("✅ Reconnected to server");
  isConnected = true;
  startSendingMessages();
});

// Listen for responses from server
socket.on("messageReceived", (data) => {
  if (data.success) {
    console.log(`✅ Server confirmed message #${data.messageId} received`);
  } else {
    console.error(`❌ Server error for message:`, data.error);
  }
});

// Broadcast listener (messages from other clients)
socket.on("newContinuousMessage", (data) => {
  console.log(`📢 Broadcast from ${data.from.substring(0, 8)}...`);
});

// Function to start sending messages continuously
function startSendingMessages() {
  if (sendInterval) {
    clearInterval(sendInterval);
  }

  console.log("📤 Starting to send messages every 5 seconds...");
  console.log("   Format: [TIME] 📨 Sent message #N\n");

  sendInterval = setInterval(() => {
    if (isConnected) {
      messageCount++;

      const message = {
        id: messageCount,
        text: `Message #${messageCount} - ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        clientId: socket.id,
        data: {
          temperature: Math.random() * 100,
          humidity: Math.random() * 100,
          location: {
            latitude: 40.7128 + Math.random() * 0.1,
            longitude: -74.006 + Math.random() * 0.1,
          },
        },
      };

      try {
        socket.emit("continuousMessage", message);
        console.log(
          `[${new Date().toLocaleTimeString()}] 📨 Sent message #${messageCount}`,
        );
      } catch (error) {
        console.error(
          `[${new Date().toLocaleTimeString()}] ❌ Error sending message #${messageCount}:`,
          error.message,
        );
      }
    } else {
      console.log(
        `[${new Date().toLocaleTimeString()}] ⏸️  Not connected - waiting to reconnect...`,
      );
    }
  }, 5000); // Send every 5 seconds
}

// Function to stop sending messages
function stopSendingMessages() {
  if (sendInterval) {
    clearInterval(sendInterval);
    console.log("⏹️  Stopped sending messages");
  }
}

// Function to change sending interval
function setMessageInterval(milliseconds) {
  stopSendingMessages();
  console.log(
    `⏱️  Message interval changed to ${milliseconds}ms (${(milliseconds / 1000).toFixed(1)}s)`,
  );

  sendInterval = setInterval(() => {
    if (isConnected) {
      messageCount++;

      const message = {
        id: messageCount,
        text: `Message #${messageCount} - ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        clientId: socket.id,
      };

      socket.emit("continuousMessage", message);
      console.log(
        `[${new Date().toLocaleTimeString()}] 📨 Sent message #${messageCount}`,
      );
    }
  }, milliseconds);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  stopSendingMessages();
  socket.disconnect();
  console.log(`📊 Total messages sent: ${messageCount}`);
  process.exit(0);
});

// Export for use as a module
module.exports = {
  socket,
  stopSendingMessages,
  setMessageInterval,
  getMessageCount: () => messageCount,
};
