/\*\*

- ========================================
- QUICK COPY-PASTE COMMANDS
- ========================================
  \*/

// ============================================
// WINDOWS POWERSHELL (Recommended)
// ============================================

// Single request:
$body = @{latitude = 40.7128; longitude = -74.006; transmitid = "device-001"; deviceId = "device-123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/livedata" -Method Post -ContentType "application/json" -Body $body

// 5 continuous requests (every 5 seconds):
$body = @{latitude = 40.7128; longitude = -74.006; transmitid = "device-001"; deviceId = "device-123"} | ConvertTo-Json
1..5 | ForEach-Object { Invoke-RestMethod -Uri "http://localhost:3000/livedata" -Method Post -ContentType "application/json" -Body $body; Start-Sleep -Seconds 5 }

// Continuous loop (infinite):
while ($true) {
  $body = @{latitude = 40.7128; longitude = -74.006; transmitid = "device-$(Get-Random -Minimum 1 -Maximum 100)"; deviceId = "device-123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/livedata" -Method Post -ContentType "application/json" -Body $body
Start-Sleep -Seconds 5
}

// Using the PowerShell script:
.\sendPostRequest.ps1 -count 5 -interval 5

// ============================================
// WINDOWS COMMAND PROMPT (CMD)
// ============================================

// Single request:
curl -X POST http://localhost:3000/livedata -H "Content-Type: application/json" -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-001\", \"deviceId\": \"device-123\"}"

// Using batch script:
sendPostRequest.bat

// ============================================
// LINUX / MAC
// ============================================

// Single request:
curl -X POST http://localhost:3000/livedata \
 -H "Content-Type: application/json" \
 -d '{"latitude": 40.7128, "longitude": -74.006, "transmitid": "device-001", "deviceId": "device-123"}'

// 5 continuous requests:
for i in {1..5}; do
curl -X POST http://localhost:3000/livedata \
 -H "Content-Type: application/json" \
 -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-$i\", \"deviceId\": \"device-123\"}"
sleep 5
done

// Continuous loop (infinite):
while true; do
curl -X POST http://localhost:3000/livedata \
 -H "Content-Type: application/json" \
 -d "{\"latitude\": 40.7128, \"longitude\": -74.006}"
sleep 5
done

// ============================================
// NODE.JS (Any Platform)
// ============================================

// Single request:
node -e "const axios = require('axios'); axios.post('http://localhost:3000/livedata', {latitude: 40.7128, longitude: -74.006, transmitid: 'device-001', deviceId: 'device-123'}).then(r => console.log('✅', r.data.message)).catch(e => console.error('❌', e.message));"

// Using continuous sender:
node continuousLiveDataPost.js

// Using test script:
node testLiveDataPost.js

// ============================================
// EXAMPLES WITH ACTUAL DATA
// ============================================

// New York City location:
curl -X POST http://localhost:3000/livedata -H "Content-Type: application/json" -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-nyc\", \"deviceId\": \"device-main\"}"

// San Francisco:
curl -X POST http://localhost:3000/livedata -H "Content-Type: application/json" -d "{\"latitude\": 37.7749, \"longitude\": -122.4194, \"transmitid\": \"device-sf\", \"deviceId\": \"device-main\"}"

// With temperature and humidity:
curl -X POST http://localhost:3000/livedata -H "Content-Type: application/json" -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-001\", \"deviceId\": \"device-123\", \"temperature\": 25.5, \"humidity\": 65.0}"

// ============================================
// CHECKING IF SERVER IS RUNNING
// ============================================

// PowerShell:
Test-Connection localhost -Port 3000

// Command Prompt:
netstat -ano | findstr :3000

// Linux/Mac:
lsof -i :3000

// ============================================
// SEEING SERVER LOGS
// ============================================

// When you run the POST requests, you should see in server terminal:
// 📍 /livedata POST request received!
// Timestamp: 4:30:45 PM
// Data received:
// - Latitude: 40.7128
// - Longitude: -74.006
// ...

// ============================================
// COMMON ISSUES & FIXES
// ============================================

// Error: "Connection refused"
// Fix: Make sure server is running
// npm run dev

// Error: "curl: command not found"
// Fix: Install curl or use PowerShell

// Error: "'localhost' is not recognized"
// Fix: Use "127.0.0.1" instead of "localhost"
// curl -X POST http://127.0.0.1:3000/livedata ...

// ============================================
// RECOMMENDED WORKFLOW
// ============================================

// 1. Start the server
// npm run dev

// 2. In another terminal, run one of these:

// Option A - PowerShell (Recommended):
$body = @{latitude = 40.7128; longitude = -74.006} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/livedata" -Method Post -ContentType "application/json" -Body $body

// Option B - Node.js:
node continuousLiveDataPost.js

// Option C - CURL:
curl -X POST http://localhost:3000/livedata -H "Content-Type: application/json" -d "{\"latitude\": 40.7128, \"longitude\": -74.006}"

// 3. Check server logs for incoming requests

// 4. To stop sending: Ctrl+C in the client terminal

module.exports = { quickCommands: true };
