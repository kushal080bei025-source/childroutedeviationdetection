// Diagnostic tool to debug Socket.IO connection issues

const io = require("socket.io-client");
const http = require("http");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

console.log("🔍 Socket.IO Connection Diagnostic Tool");
console.log("=====================================\n");

// Step 1: Check if server is reachable via HTTP
console.log("Step 1: Checking if server is reachable via HTTP...");
checkHttpConnection();

function checkHttpConnection() {
  const req = http.get(SERVER_URL, { timeout: 5000 }, (res) => {
    console.log("✅ Server is reachable via HTTP");
    console.log(`   Status: ${res.statusCode}`);
    res.on("data", () => {});
    res.on("end", () => {
      console.log("\nStep 2: Attempting Socket.IO connection...\n");
      attemptSocketConnection();
    });
  });

  req.on("error", (error) => {
    console.error("❌ Cannot reach server via HTTP at " + SERVER_URL);
    console.error("   Error:", error.message);
    console.log("\n🔴 Make sure your server is running on port 3000!");
    console.log("   Start your server with: npm run dev");
    process.exit(1);
  });

  req.on("timeout", () => {
    req.destroy();
    console.error("❌ HTTP request timed out - Server may not be running");
    console.log("\n🔴 Make sure your server is running on port 3000!");
    console.log("   Start your server with: npm run dev");
    process.exit(1);
  });
}

function attemptSocketConnection() {
  const socket = io(SERVER_URL, {
    transports: ["websocket", "polling"],
    forceNew: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 500,
  });

  const timeout = setTimeout(() => {
    console.error("❌ Socket.IO connection timed out");
    console.error("   Possible issues:");
    console.error("   - CORS configuration");
    console.error("   - Socket.IO not properly initialized on server");
    console.error("   - Firewall/network issue");
    socket.disconnect();
    process.exit(1);
  }, 10000);

  socket.on("connect", () => {
    clearTimeout(timeout);
    console.log("✅ Socket.IO connection successful!");
    console.log("   Socket ID:", socket.id);
    console.log("   Transport:", socket.io.engine.transport.name);

    console.log("\n📊 Connection Details:");
    console.log("   Server URL:", SERVER_URL);
    console.log("   Connected at:", new Date().toLocaleTimeString());

    console.log("\n🎯 Attempting to emit test message...");
    socket.emit("continuousMessage", {
      id: 1,
      text: "Test message from diagnostic",
      timestamp: new Date(),
      clientId: socket.id,
    });

    socket.on("messageReceived", (data) => {
      console.log("✅ Test message received by server!");
      console.log("   Response:", data);
      console.log("\n✨ Connection is working correctly!");
      console.log("   You can now run: node continuousMessageClient.js");
      socket.disconnect();
      process.exit(0);
    });

    setTimeout(() => {
      console.log(
        "\n⚠️  No response from server, but connection is established.",
      );
      console.log("   Server may not have the message handler set up.");
      console.log("   Make sure continuousMessageHandler is integrated.");
      socket.disconnect();
      process.exit(0);
    }, 3000);
  });

  socket.on("connect_error", (error) => {
    clearTimeout(timeout);
    console.error("❌ Socket.IO connection error:");
    console.error("   Message:", error.message);
    console.error("   Type:", error.type);

    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check if Node.js server is running:");
    console.log("      npm run dev");
    console.log("   2. Check if port 3000 is available");
    console.log("   3. Check server logs for Socket.IO initialization");
    console.log("   4. Verify CORS configuration in server.js");
    console.log("   5. Try changing SERVER_URL if running on different host");

    socket.disconnect();
    process.exit(1);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
}

console.log(`Targeting: ${SERVER_URL}\n`);
