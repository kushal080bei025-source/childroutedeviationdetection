// INTEGRATION GUIDE: How to use the continuous message system

/**
 * ========================================
 * OPTION 1: Socket.IO (Recommended for Real-time Communication)
 * ========================================
 */

// Step 1: Add to your server.js
const { continuousMessageHandler } = require("./continuousMessageHandler");

// In your Socket.IO setup (around line where you initialize io):
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});

io.on("connection", (socket) => {
  // Add the continuous message handler
  continuousMessageHandler(io, socket);

  // Your other socket handlers...
});

// Step 2: Run the client script on another terminal
// node continuousMessageClient.js

// Output will show:
// ✓ Connected to server with Socket ID: abc123
// [10:30:45 AM] Sent message: 1
// [10:30:50 AM] Sent message: 2
// Server response: { success: true, messageId: 1, ... }

/**
 * ========================================
 * OPTION 2: REST API (HTTP Requests)
 * ========================================
 */

// Step 1: Add to your server.js (in your route setup)
const { continuousMessageRestHandler } = require("./continuousMessageHandler");

// Add the REST endpoints
continuousMessageRestHandler(app);

// Step 2: Run the HTTP client
// node -e "const Client = require('./continuousMessageHttpClient'); const c = new Client(); c.start(5000);"

// Or create a separate file to run:
// Create a file called 'start-http-client.js':
const ContinuousMessageHttpClient = require("./continuousMessageHttpClient");
const client = new ContinuousMessageHttpClient("http://localhost:3000");
client.start(5000); // Send every 5 seconds

/**
 * ========================================
 * OPTION 3: Browser Client (For Frontend Testing)
 * ========================================
 */

// Add to your HTML/Frontend:
// <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
// <script>
//   const socket = io('http://localhost:3000');
//   let messageCount = 0;
//
//   socket.on('connect', () => {
//     console.log('Connected!');
//     setInterval(() => {
//       messageCount++;
//       socket.emit('continuousMessage', {
//         id: messageCount,
//         text: 'Message ' + messageCount,
//         timestamp: new Date()
//       });
//     }, 5000);
//   });
//
//   socket.on('messageReceived', (data) => {
//     console.log('Server received:', data);
//   });
// </script>

/**
 * ========================================
 * CONFIGURATION OPTIONS
 * ========================================
 */

// Change message sending interval:
// client.setMessageInterval(2000); // Send every 2 seconds instead of 5

// Stop sending:
// client.stopSendingMessages();

// Get message count:
// console.log(client.getMessageCount()); // Returns total messages sent

// Check server status:
// curl http://localhost:3000/api/continuous-message/status

/**
 * ========================================
 * DATABASE INTEGRATION (MongoDB)
 * ========================================
 */

// If you want to save messages to database, create a schema:
// const messageSchema = new mongoose.Schema({
//   clientId: String,
//   text: String,
//   data: mongoose.Schema.Types.Mixed,
//   timestamp: { type: Date, default: Date.now },
//   receivedAt: Date
// });
//
// const MessageModel = mongoose.model('Message', messageSchema);
//
// Then uncomment the database save sections in the handler files.

/**
 * ========================================
 * ENVIRONMENT SETUP
 * ========================================
 */

// Make sure your .env has:
// NODE_ENV=development
// PORT=3000
// MONGODB_URI=your_mongo_connection_string

// Run server:
// npm run dev

// In another terminal, run client:
// node continuousMessageClient.js
// OR
// node -e "const Client = require('./continuousMessageHttpClient'); new Client().start(5000);"

/**
 * ========================================
 * PRODUCTION CHECKLIST
 * ========================================
 */

// Before deploying:
// [ ] Set secure CORS origins
// [ ] Add rate limiting middleware
// [ ] Add authentication/token validation
// [ ] Add error logging/monitoring
// [ ] Set appropriate timeouts
// [ ] Add message validation
// [ ] Add database indexing for performance
// [ ] Use environment variables for configuration
// [ ] Add graceful shutdown handling
// [ ] Monitor memory usage for long-running processes

module.exports = { guide: "See comments above" };
