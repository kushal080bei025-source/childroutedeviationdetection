/**
 * ========================================
 * DEBUGGING GUIDE: Messages Not Being Received
 * ========================================
 *
 * If your Socket.IO messages are being SENT from the client but NOT RECEIVED by the server,
 * follow this troubleshooting guide.
 */

// ============================================
// STEP 1: Run Message Test
// ============================================
// Terminal 1: Start your server
//   npm run dev
//
// Terminal 2: Run the test script
//   node testMessageReceiver.js
//
// Expected output:
//   ✅ Connected to server
//   📱 Socket ID: xyz...
//   📤 Sending test message...
//   ✅ Server responded!
//   ✨ Test PASSED - Message was received by server!
//
// If test FAILS, see the troubleshooting sections below

// ============================================
// ISSUE 1: Messages sent but no server response
// ============================================
// Symptoms:
//   - Client shows: "📨 Sent message #1"
//   - But: Server doesn't show "📨 Continuous message received!"
//   - And: Client never gets "✓ Server received message #1"
//
// Solutions:
//   A) Check server logs - look for error messages
//   B) Make sure socket handler is properly defined
//   C) Restart the server: npm run dev
//   D) Check if another process is listening on port 3000

// ============================================
// ISSUE 2: Connection works but handler not called
// ============================================
// Symptoms:
//   - Client connects: "✅ Connected to server"
//   - But: socket.on("continuousMessage") is never triggered
//
// Solutions:
//   A) Verify the socket handler is in server.js:
//      socket.on("continuousMessage", (message) => {
//        console.log("📨 Continuous message received!");
//      });
//
//   B) Check handler is inside io.on("connection") block:
//      io.on("connection", (socket) => {
//        socket.on("continuousMessage", (message) => {  // ✅ CORRECT
//          ...
//        });
//      });
//
//   C) NOT like this:
//      socket.on("continuousMessage", (message) => {  // ❌ WRONG
//        ...
//      });

// ============================================
// ISSUE 3: Messages show in client but not server
// ============================================
// Symptoms:
//   - Client terminal shows: [10:30:45] 📨 Sent message #1
//   - Server terminal shows: "User Connected: abc123"
//   - But never shows: "📨 Continuous message received!"
//
// Solutions:
//   1. Check if the handler is in the right place in server.js
//   2. Verify correct Socket.IO version:
//      npm list socket.io socket.io-client
//   3. Try restarting both client and server
//   4. Check if messages are being sent with correct event name:
//      socket.emit("continuousMessage", message);  // ✅ Exact match needed

// ============================================
// DETAILED DEBUGGING
// ============================================
// Add this to your server.js inside io.on("connection"):

// Log ALL events received
/*
socket.on("*", (event, ...args) => {
  console.log("🔍 EVENT RECEIVED:", event);
  console.log("   Data:", args[0]);
});
*/

// Or add to client to verify what's being sent:
/*
const originalEmit = socket.emit;
socket.emit = function(eventName, ...args) {
  console.log(`📤 [CLIENT EMIT] ${eventName}:`, args[0]);
  return originalEmit.apply(socket, arguments);
};
*/

// ============================================
// VERIFICATION CHECKLIST
// ============================================

// [ ] 1. Server is running (npm run dev)
// [ ] 2. No errors in server console
// [ ] 3. Client connects successfully (✅ Connected to server)
// [ ] 4. Client shows transport (🚀 Transport: websocket or polling)
// [ ] 5. Client shows "📨 Sent message" logs
// [ ] 6. Run testMessageReceiver.js and it PASSES
// [ ] 7. Server shows socket connection (✅ User Connected: xxx)
// [ ] 8. Socket.IO packages are installed:
//         npm list socket.io socket.io-client
// [ ] 9. Handler is inside io.on("connection") block
// [ ] 10. Event name matches: "continuousMessage" (case-sensitive)

// ============================================
// STEP-BY-STEP DEBUGGING PROCESS
// ============================================

// 1. Stop everything
//    Ctrl+C in both terminals

// 2. Clear node_modules and reinstall
//    rm -r node_modules package-lock.json
//    npm install

// 3. Verify server.js has the handler
//    grep -n "continuousMessage" server.js
//    Should show: socket.on("continuousMessage", ...)

// 4. Verify client.js emits correctly
//    grep -n "continuousMessage" continuousMessageClient.js
//    Should show: socket.emit("continuousMessage", ...)

// 5. Start server with verbose logging
//    npm run dev

// 6. In another terminal, run test
//    node testMessageReceiver.js

// 7. Check output - does server show the message?
//    Look for: "📨 Continuous message received!"

// 8. If test passes, run client
//    node continuousMessageClient.js

// 9. Check both terminals for logs

// ============================================
// COMMON EVENT NAME MISTAKES
// ============================================

// ❌ WRONG - Different names on client and server
// Client: socket.emit("message", data)
// Server: socket.on("continuousMessage", (data) => {})
// → They don't match! Event won't be received

// ❌ WRONG - Case sensitivity
// Client: socket.emit("ContinuousMessage", data)
// Server: socket.on("continuousMessage", (data) => {})
// → "ContinuousMessage" ≠ "continuousMessage"

// ✅ CORRECT - Exact match
// Client: socket.emit("continuousMessage", data)
// Server: socket.on("continuousMessage", (data) => {})
// → Perfect match!

// ============================================
// SERVER.JS HANDLER TEMPLATE
// ============================================

/*
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);
  
  // This is where the handler MUST be
  socket.on("continuousMessage", (message) => {
    console.log("📨 Continuous message received!");
    console.log("   ID:", message.id);
    console.log("   Data:", message.data);
    
    // Send acknowledgment
    socket.emit("messageReceived", {
      success: true,
      messageId: message.id
    });
  });
  
  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
  });
});
*/

// ============================================
// STILL NOT WORKING?
// ============================================

// 1. Check if Socket.IO is actually loaded
//    In server.js, add at top:
//    console.log("Socket.IO version:", require("socket.io/package.json").version);

// 2. Add debug mode to Socket.IO
//    const io = new Server(server, {
//      cors: { origin: "*" },
//      transports: ["websocket", "polling"],
//      debug: true  // Add this
//    });

// 3. Check browser console for errors (if running in browser)
//    F12 → Console tab

// 4. Check client console for errors
//    Look for "connect_error" or "error" events

// 5. Test with curl (if using HTTP polling)
//    curl -X POST http://localhost:3000/test

// 6. Check firewall isn't blocking connections
//    Make sure port 3000 is allowed

// 7. Try different port
//    Change PORT in .env to 3001

// 8. Reinstall socket.io
//    npm uninstall socket.io socket.io-client
//    npm install socket.io socket.io-client

module.exports = { debuggingGuide: true };
