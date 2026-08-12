/\*\*

- ========================================
- COMMAND LINE POST REQUEST GUIDE
- ========================================
-
- How to send POST requests to /livedata from command line/terminal
  \*/

// ============================================
// METHOD 1: Using CURL (Windows/Mac/Linux)
// ============================================

// Single POST request:
// curl -X POST http://localhost:3000/livedata ^
// -H "Content-Type: application/json" ^
// -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-001\", \"deviceId\": \"device-123\"}"

// Formatted for readability:
/_
curl -X POST http://localhost:3000/livedata ^
-H "Content-Type: application/json" ^
-d {
"latitude": 40.7128,
"longitude": -74.006,
"transmitid": "device-001",
"deviceId": "device-123",
"temperature": 25.5,
"humidity": 65.0
}
_/

// With pretty-printed response:
// curl -X POST http://localhost:3000/livedata ^
// -H "Content-Type: application/json" ^
// -d "{\"latitude\": 40.7128, \"longitude\": -74.006}" | findstr.exe .

// Save response to file:
// curl -X POST http://localhost:3000/livedata ^
// -H "Content-Type: application/json" ^
// -d "{\"latitude\": 40.7128, \"longitude\": -74.006}" > response.json

// ============================================
// METHOD 2: Using PowerShell (Windows)
// ============================================

// Basic POST:
// $body = @{
// latitude = 40.7128
// longitude = -74.006
// transmitid = "device-001"
// deviceId = "device-123"
// } | ConvertTo-Json
//
// Invoke-WebRequest -Uri "http://localhost:3000/livedata" `//   -Method Post`
// -Headers @{"Content-Type"="application/json"} `
// -Body $body

// PowerShell one-liner:
// $body = @{latitude=40.7128; longitude=-74.006; transmitid="device-001"; deviceId="device-123"} | ConvertTo-Json; Invoke-WebRequest -Uri "http://localhost:3000/livedata" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body

// With response output:
// $body = @{latitude=40.7128; longitude=-74.006} | ConvertTo-Json
// $response = Invoke-WebRequest -Uri "http://localhost:3000/livedata" -Method Post -ContentType "application/json" -Body $body
// $response.Content | ConvertFrom-Json | Format-List

// ============================================
// METHOD 3: Using Invoke-RestMethod (PowerShell)
// ============================================

// More modern PowerShell approach:
// $params = @{
// Uri = "http://localhost:3000/livedata"
// Method = "Post"
// ContentType = "application/json"
// Body = @{
// latitude = 40.7128
// longitude = -74.006
// transmitid = "device-001"
// deviceId = "device-123"
// temperature = 25.5
// humidity = 65.0
// } | ConvertTo-Json
// }
// Invoke-RestMethod @params

// ============================================
// METHOD 4: Using WGET (Windows/Linux)
// ============================================

// wget -O - --post-data="{\"latitude\": 40.7128, \"longitude\": -74.006}" ^
// --header="Content-Type: application/json" ^
// http://localhost:3000/livedata

// ============================================
// METHOD 5: Using Node.js from Command Line
// ============================================

// One-liner:
// node -e "const http = require('http'); const data = JSON.stringify({latitude: 40.7128, longitude: -74.006}); const req = http.request({hostname: 'localhost', port: 3000, path: '/livedata', method: 'POST', headers: {'Content-Type': 'application/json', 'Content-Length': data.length}}, (res) => console.log(res.statusCode)); req.write(data); req.end();"

// In a file (postRequest.js):
// const http = require('http');
//
// const data = JSON.stringify({
// latitude: 40.7128,
// longitude: -74.006,
// transmitid: 'device-001',
// deviceId: 'device-123'
// });
//
// const req = http.request({
// hostname: 'localhost',
// port: 3000,
// path: '/livedata',
// method: 'POST',
// headers: {
// 'Content-Type': 'application/json',
// 'Content-Length': data.length
// }
// }, (res) => {
// console.log(`Status: ${res.statusCode}`);
// res.on('data', (chunk) => console.log(chunk.toString()));
// });
//
// req.on('error', console.error);
// req.write(data);
// req.end();
//
// Run: node postRequest.js

// ============================================
// PRACTICAL EXAMPLES - COPY & PASTE
// ============================================

// WINDOWS POWERSHELL - Simple request:
/\*
$body = @{
latitude = 40.7128
longitude = -74.006
transmitid = "device-001"
deviceId = "device-123"
temperature = 25.5
humidity = 65.0
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/livedata" `    -Method Post`
-ContentType "application/json" `
-Body $body
\*/

// WINDOWS COMMAND PROMPT - Using CURL:
/_
curl -X POST http://localhost:3000/livedata -H "Content-Type: application/json" -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-001\", \"deviceId\": \"device-123\"}"
_/

// LINUX/MAC - Using CURL:
/_
curl -X POST http://localhost:3000/livedata \
 -H "Content-Type: application/json" \
 -d '{
"latitude": 40.7128,
"longitude": -74.006,
"transmitid": "device-001",
"deviceId": "device-123",
"temperature": 25.5,
"humidity": 65.0
}'
_/

// LINUX/MAC - Using wget:
/_
wget -O - --post-data='{"latitude": 40.7128, "longitude": -74.006}' \
 --header="Content-Type: application/json" \
 http://localhost:3000/livedata
_/

// ============================================
// TESTING WITH DIFFERENT DATA
// ============================================

// Test 1: Minimal data
// curl -X POST http://localhost:3000/livedata ^
// -H "Content-Type: application/json" ^
// -d "{\"latitude\": 40.7128, \"longitude\": -74.006}"

// Test 2: Full data with temperature and humidity
// curl -X POST http://localhost:3000/livedata ^
// -H "Content-Type: application/json" ^
// -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-001\", \"deviceId\": \"device-123\", \"temperature\": 25.5, \"humidity\": 65.0}"

// Test 3: Multiple devices
// FOR /L %i IN (1,1,5) DO (
// curl -X POST http://localhost:3000/livedata ^
// -H "Content-Type: application/json" ^
// -d "{\"latitude\": 40.7128, \"longitude\": -74.006, \"transmitid\": \"device-%i\", \"deviceId\": \"device-123\"}"
// timeout /t 2
// )

// ============================================
// LOOPING REQUESTS - CONTINUOUS TESTING
// ============================================

// WINDOWS PowerShell - Send every 5 seconds:
/\*
while ($true) {
    $body = @{
        latitude = 40.7128 + (Get-Random -Minimum -0.1 -Maximum 0.1)
        longitude = -74.006 + (Get-Random -Minimum -0.1 -Maximum 0.1)
        transmitid = "device-$(Get-Random -Minimum 1 -Maximum 100)"
deviceId = "device-123"
} | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:3000/livedata" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Start-Sleep -Seconds 5

}
\*/

// WINDOWS Command Prompt - Continuous requests:
/_
:loop
curl -X POST http://localhost:3000/livedata ^
-H "Content-Type: application/json" ^
-d "{\"latitude\": 40.7128, \"longitude\": -74.006}"
timeout /t 5
goto loop
_/

// LINUX - Continuous requests:
/_
while true; do
curl -X POST http://localhost:3000/livedata \
 -H "Content-Type: application/json" \
 -d "{\"latitude\": 40.7128, \"longitude\": -74.006}"
sleep 5
done
_/

// ============================================
// EXPECTED RESPONSES
// ============================================

// Success (200):
// {
// "success": true,
// "message": "Location received and broadcasted",
// "receivedAt": "2026-08-05T10:30:45.890Z",
// "dataReceived": {
// "latitude": 40.7128,
// "longitude": -74.006,
// "transmitid": "device-001",
// "deviceId": "device-123"
// }
// }

// Error (500):
// {
// "success": false,
// "error": "Error message"
// }

// ============================================
// TROUBLESHOOTING
// ============================================

// Error: "Connection refused"
// Fix: Make sure server is running (npm run dev)

// Error: "curl: command not found"
// Fix:
// Windows: Install Git Bash or use PowerShell
// Linux: sudo apt-get install curl
// Mac: brew install curl

// Error: "Invalid JSON"
// Fix: Check quotes in JSON - use \" for escaping

// Error: "timeout"
// Fix: Check if localhost:3000 is accessible
// Verify firewall settings

// No response
// Fix: Check server logs for errors
// Verify /livedata endpoint is set up correctly

// ============================================
// BEST METHOD TO USE
// ============================================

// Windows: PowerShell (Method 3)
// - Built-in
// - Easy syntax
// - Good output formatting
// - Example: node continuousLiveDataPost.js

// Linux/Mac: CURL (Method 1)
// - Most common
// - Widely supported
// - Simple syntax

// Quick testing: Use the continuous sender
// node continuousLiveDataPost.js

module.exports = { commandLineGuide: true };
