/**
 * ========================================
 * POST REQUEST GUIDE FOR /livedata ENDPOINT
 * ========================================
 */

// ============================================
// QUICK START
// ============================================

// Terminal 1: Start your server
//   npm run dev
//
// Expected output:
//   MongoDB Connected
//   Server running on port 3000

// Terminal 2: Test single POST request
//   node testLiveDataPost.js
//
// Expected output in Terminal 1 (Server):
//   📍 /livedata POST request received!
//   Timestamp: 4:30:45 PM
//   Data received:
//     - Latitude: 40.7128
//     - Longitude: -74.006
//     ...

// Expected output in Terminal 2 (Client):
//   ✅ Server responded successfully!
//   Status Code: 200
//   Response: { success: true, message: "Location received and broadcasted" }
//   ✨ Test PASSED

// ============================================
// CONTINUOUS POST REQUESTS
// ============================================

// Terminal 3: Send continuous POST requests
//   node continuousLiveDataPost.js
//
// Expected output in Terminal 2:
//   📤 Starting to send POST requests every 5000ms
//   [4:30:45 PM] 📨 POST #1 → Server: 200
//                ✅ Received - Lat: 40.7128, Lng: -74.0060
//   [4:30:50 PM] 📨 POST #2 → Server: 200
//                ✅ Received - Lat: 40.7135, Lng: -74.0055
//
// Expected output in Terminal 1 (Server logs):
//   📍 /livedata POST request received!
//   Timestamp: 4:30:45 PM
//   Data received:
//     - Latitude: 40.7128
//     - Longitude: -74.006
//     - Transmit ID: device-45
//     - Temperature: 67.89
//     - Humidity: 43.21

// ============================================
// FILE DESCRIPTIONS
// ============================================

// 1. testLiveDataPost.js
//    - Sends a single test POST request
//    - Uses axios library
//    - Verifies the /livedata endpoint is working
//    - Usage: node testLiveDataPost.js

// 2. continuousLiveDataPost.js
//    - Sends POST requests continuously every 5 seconds
//    - Includes random location data
//    - Can be exported as a module
//    - Usage: node continuousLiveDataPost.js
//    - OR: const Sender = require('./continuousLiveDataPost');
//          const sender = new Sender('http://localhost:3000');
//          sender.start(5000);

// 3. /livedata endpoint (in server.js)
//    - Accepts POST requests with location data
//    - Logs all received data to console
//    - Broadcasts to Socket.IO clients
//    - Returns success/error response

// ============================================
// REQUEST/RESPONSE FORMAT
// ============================================

// REQUEST (what to send to /livedata):
// POST /livedata HTTP/1.1
// Content-Type: application/json
//
// {
//   "latitude": 40.7128,
//   "longitude": -74.006,
//   "transmitid": "device-001",
//   "deviceId": "device-123",
//   "temperature": 25.5,
//   "humidity": 65.0,
//   "timestamp": "2026-08-05T10:30:45.890Z"
// }

// RESPONSE (what server sends back):
// HTTP/1.1 200 OK
// Content-Type: application/json
//
// {
//   "success": true,
//   "message": "Location received and broadcasted",
//   "receivedAt": "2026-08-05T10:30:45.890Z",
//   "dataReceived": {
//     "latitude": 40.7128,
//     "longitude": -74.006,
//     "transmitid": "device-001",
//     "deviceId": "device-123"
//   }
// }

// ============================================
// USING WITH CURL (Testing)
// ============================================

// Single request:
// curl -X POST http://localhost:3000/livedata \
//   -H "Content-Type: application/json" \
//   -d '{
//     "latitude": 40.7128,
//     "longitude": -74.006,
//     "transmitid": "device-001",
//     "deviceId": "device-123"
//   }'

// Expected response:
// {"success":true,"message":"Location received and broadcasted","receivedAt":"..."}

// ============================================
// USING WITH AXIOS (Node.js)
// ============================================

// const axios = require('axios');
//
// const data = {
//   latitude: 40.7128,
//   longitude: -74.006,
//   transmitid: 'device-001',
//   deviceId: 'device-123',
//   temperature: 25.5,
//   humidity: 65.0
// };
//
// axios.post('http://localhost:3000/livedata', data)
//   .then(response => {
//     console.log('✅ Success:', response.data);
//   })
//   .catch(error => {
//     console.error('❌ Error:', error.message);
//   });

// ============================================
// USING WITH FETCH (Browser/Client)
// ============================================

// const data = {
//   latitude: 40.7128,
//   longitude: -74.006,
//   transmitid: 'device-001',
//   deviceId: 'device-123'
// };
//
// fetch('http://localhost:3000/livedata', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify(data)
// })
// .then(response => response.json())
// .then(data => console.log('✅ Success:', data))
// .catch(error => console.error('❌ Error:', error));

// ============================================
// CONTINUOUS SENDER API
// ============================================

// const LiveDataPostSender = require('./continuousLiveDataPost');
//
// const sender = new LiveDataPostSender('http://localhost:3000');
//
// // Start sending every 5 seconds
// sender.start(5000);
//
// // Check status
// console.log(sender.getStatus());
// // { running: true, messagesSent: 5, endpoint: 'http://localhost:3000/livedata', ... }
//
// // Stop sending
// sender.stop();
//
// // Send single request
// await sender.sendSingle({
//   latitude: 40.7128,
//   longitude: -74.006,
//   deviceId: 'device-main'
// });
//
// // Change interval to 2 seconds
// sender.setInterval(2000);

// ============================================
// SERVER LOGGING
// ============================================

// When a POST request arrives at /livedata, you'll see:
//
// 📍 /livedata POST request received!
//    Timestamp: 4:30:45 PM
//    IP: ::1
//    Data received:
//      - Latitude: 40.7128
//      - Longitude: -74.006
//      - Transmit ID: device-001
//      - Device ID: device-123
//      - Temperature: 25.5
//      - Humidity: 65.0
//    ---

// ============================================
// BROADCASTING TO SOCKET.IO CLIENTS
// ============================================

// The /livedata endpoint also broadcasts the received data
// to all connected Socket.IO clients using:
//
// io.emit("location-update", {
//   latitude: 40.7128,
//   longitude: -74.006,
//   transmitid: "device-001",
//   deviceId: "device-123",
//   temperature: 25.5,
//   humidity: 65.0,
//   receivedAt: new Date()
// });
//
// Socket.IO clients listening for "location-update" will receive this data in real-time

// ============================================
// COMPARISON: Socket.IO vs POST Requests
// ============================================

// Socket.IO (continuousMessageClient.js):
//   ✓ Real-time bidirectional communication
//   ✓ Persistent connection
//   ✓ Lower latency
//   ✓ Better for live updates
//   ✗ More complex setup
//   ✗ Requires socket.io-client library
//
// POST Requests (continuousLiveDataPost.js):
//   ✓ Simple HTTP requests
//   ✓ No persistent connection needed
//   ✓ Works with any HTTP client
//   ✓ Easier to test with curl
//   ✓ Stateless
//   ✗ Higher latency
//   ✗ No real-time updates
//   ✗ Polling-based

// ============================================
// TROUBLESHOOTING POST REQUESTS
// ============================================

// Issue: "Connection refused" or "Cannot reach server"
// Fix: Make sure server is running (npm run dev)

// Issue: 400 Bad Request
// Fix: Check JSON format is correct
//      Check Content-Type header is application/json

// Issue: 401 Unauthorized
// Fix: The endpoint checks for authentication
//      Comment out or remove the authentication check

// Issue: POST requests received but data is undefined
// Fix: Make sure express.json() middleware is set up
//      It should be in server.js: app.use(express.json());

// Issue: Data not logged on server
// Fix: Check if server is actually running
//      Look for "📍 /livedata POST request received!" in logs
//      Verify the correct port is being used

// ============================================
// PRODUCTION CHECKLIST
// ============================================

// [ ] Requests are received by server
// [ ] Server logs show proper data format
// [ ] Socket.IO clients receive broadcasted data
// [ ] Error handling is in place
// [ ] Data is validated before processing
// [ ] Rate limiting is implemented (if needed)
// [ ] Authentication is verified
// [ ] CORS is configured if requests from different origin
// [ ] Database saves location history (if needed)
// [ ] Monitoring is set up for failed requests

module.exports = { postRequestGuide: true };
