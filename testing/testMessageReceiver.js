/**
 * Test Script: Verify Socket.IO Messages are Being Received
 *
 * This script will:
 * 1. Connect to the server
 * 2. Send a test message
 * 3. Listen for the response
 * 4. Report if the message was successfully received
 */

const io = require("socket.io-client");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

console.log("🧪 Socket.IO Message Test\n");
console.log("Server:", SERVER_URL);
console.log("================================\n");

const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
});

let testComplete = false;
const timeout = setTimeout(() => {
  if (!testComplete) {
    console.error("❌ Test timed out - no response from server");
    console.error("   Make sure:");
    console.error("   1. Server is running (npm run dev)");
    console.error("   2. continuousMessage handler is set up");
    console.error("   3. Server is listening on port 3000");
    socket.disconnect();
    process.exit(1);
  }
}, 10000);

socket.on("connect", () => {
  console.log("✅ Connected to server");
  console.log("📱 Socket ID:", socket.id);
  console.log("\n📤 Sending test message...\n");

  const testMessage = {
    id: 1,
    text: "Test Message from Test Script",
    timestamp: new Date(),
    clientId: socket.id,
    data: {
      temperature: 25.5,
      humidity: 65.0,
      location: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    },
  };

  console.log("Message being sent:");
  console.log(JSON.stringify(testMessage, null, 2));
  console.log("\n⏳ Waiting for server response...\n");

  socket.emit("continuousMessage", testMessage);

  // Listen for acknowledgment
  socket.on("messageReceived", (response) => {
    clearTimeout(timeout);
    testComplete = true;

    console.log("✅ Server responded!");
    console.log("\nResponse from server:");
    console.log(JSON.stringify(response, null, 2));

    if (response.success) {
      console.log("\n✨ Test PASSED - Message was received by server!");
      console.log("\n📊 Summary:");
      console.log("   ✓ Connection successful");
      console.log("   ✓ Message sent successfully");
      console.log("   ✓ Server processed the message");
      console.log("   ✓ Server sent acknowledgment");
      console.log("\n🎯 You can now run: node continuousMessageClient.js");
    } else {
      console.log("\n❌ Test FAILED - Server reported error");
      console.log("   Error:", response.error);
    }

    socket.disconnect();
    process.exit(response.success ? 0 : 1);
  });
});

socket.on("connect_error", (error) => {
  clearTimeout(timeout);
  testComplete = true;
  console.error("❌ Connection error:", error.message);
  console.error("\nTroubleshooting:");
  console.error("1. Is server running? npm run dev");
  console.error("2. Check port 3000 is available");
  console.error("3. Check server logs for errors");
  socket.disconnect();
  process.exit(1);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

console.log("Starting test...\n");
