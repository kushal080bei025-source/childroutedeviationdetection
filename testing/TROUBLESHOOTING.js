/**
 * TROUBLESHOOTING GUIDE: "xhr poll error"
 *
 * The "xhr poll error" means the Socket.IO client cannot connect to the server.
 * This can happen for several reasons. Follow these steps:
 */

// ============================================
// STEP 1: Verify Server is Running
// ============================================
// Run in terminal:
//   npm run dev
//
// Expected output:
//   $ nodemon server.js
//   MongoDB Connected
//   Server is running on port 3000
//
// If you don't see these, check:
//   - Node.js is installed: node --version
//   - Dependencies installed: npm install
//   - Environment variables configured (.env file)
//   - Port 3000 is not already in use

// ============================================
// STEP 2: Run Diagnostic Tool
// ============================================
// Run in a DIFFERENT terminal:
//   node diagnosticTool.js
//
// This will:
//   ✅ Check if server is reachable
//   ✅ Test Socket.IO connection
//   ✅ Send a test message
//   ✅ Report detailed error info
//
// Wait for output - it should show:
//   ✅ Server is reachable via HTTP
//   ✅ Socket.IO connection successful!

// ============================================
// STEP 3: If Still Getting Error...
// ============================================

// ❌ ERROR: "Cannot reach server via HTTP"
// SOLUTION:
//   1. Make sure server is running: npm run dev
//   2. Check if port 3000 is free:
//      Windows: netstat -ano | findstr :3000
//      Mac/Linux: lsof -i :3000
//   3. If port is busy, change PORT in .env file
//   4. Restart server

// ❌ ERROR: "Socket.IO connection timed out"
// SOLUTION:
//   1. Check CORS configuration in server.js (around line 167)
//   2. Make sure it includes:
//        cors: {
//          origin: ["http://localhost:3000", "*"],
//          methods: ["GET", "POST"],
//          credentials: true,
//        }
//   3. Check that io object is properly exported
//   4. Verify the server.listen() is called at the end

// ❌ ERROR: "Connection error: xhr poll error" (repeating)
// SOLUTION:
//   1. Check if Socket.IO is installed:
//      npm list socket.io
//   2. If missing, install it:
//      npm install socket.io
//   3. Verify Socket.IO is imported in server.js:
//      const { Server } = require("socket.io");
//   4. Check the io initialization line in server.js

// ============================================
// STEP 4: Check Server.js Configuration
// ============================================

// Make sure your server.js has this:

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ CORRECT Socket.IO Configuration:
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:8081",
      "http://localhost:5173",
      "*",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("continuousMessage", (message) => {
    console.log("Received message:", message);
    socket.emit("messageReceived", {
      success: true,
      messageId: message.id,
      receivedAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

// At the end of file:
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ============================================
// STEP 5: Run Continuous Message Client
// ============================================
// Once diagnostic passes, run:
//   node continuousMessageClient.js
//
// Expected output:
//   🔧 Connecting to server: http://localhost:3000
//   📡 Waiting for connection...
//   ✅ Connected to server
//   📱 Socket ID: <some-id>
//   🚀 Transport: websocket (or polling)
//   📤 Starting to send messages every 5 seconds...
//   [10:30:45 AM] 📨 Sent message #1
//   [10:30:50 AM] 📨 Sent message #2
//   ✓ Server received message #1

// ============================================
// STEP 6: Check Server Logs
// ============================================
// In the server terminal, you should see:
//   User Connected: <socket-id>
//   Received message: { id: 1, text: ..., ... }
//   Received message: { id: 2, text: ..., ... }

// ============================================
// COMMON ISSUES & FIXES
// ============================================

// Issue: Port 3000 already in use
// Fix 1: Kill process on port 3000
//   Windows: netstat -ano | findstr :3000
//            taskkill /PID <PID> /F
//   Mac/Linux: lsof -i :3000 | grep LISTEN
//              kill -9 <PID>
// Fix 2: Use different port in .env:
//   PORT=3001
//   Then connect to: http://localhost:3001

// Issue: "Module not found: socket.io"
// Fix: npm install socket.io

// Issue: "Module not found: socket.io-client"
// Fix: npm install socket.io-client

// Issue: CORS errors
// Fix: Make sure cors config includes your client URL:
//   cors: {
//     origin: "*",  // or specific origins
//     credentials: true,
//   }

// Issue: Connection works but no messages received
// Fix: Make sure continuousMessageHandler is set up:
//   socket.on("continuousMessage", (message) => {
//     socket.emit("messageReceived", { ... });
//   });

// Issue: Socket.IO works but uses polling instead of websocket
// This is OK but slower. To use websocket:
//   1. Make sure transports includes "websocket"
//   2. Check if firewall blocks WebSocket connections
//   3. Try: transports: ["websocket", "polling"]

// ============================================
// QUICK CHECKLIST
// ============================================

// [ ] Node.js is installed
// [ ] npm install completed
// [ ] .env file exists with MONGO_URI
// [ ] Port 3000 is available (or configured differently)
// [ ] socket.io package is installed
// [ ] socket.io-client package is installed
// [ ] Server starts without errors: npm run dev
// [ ] Diagnostic tool passes: node diagnosticTool.js
// [ ] Socket.IO is configured with CORS
// [ ] continuousMessageHandler is integrated
// [ ] Client can connect: node continuousMessageClient.js
// [ ] Messages appear in both client and server logs

// ============================================
// FOR MORE HELP
// ============================================
// Check server logs: Look for error messages
// Run diagnostic: node diagnosticTool.js
// Test HTTP: curl http://localhost:3000
// Monitor network: Browser DevTools > Network tab
// Socket.IO docs: https://socket.io/docs/v4/server-initialization/

module.exports = { troubleshootingGuide: true };
