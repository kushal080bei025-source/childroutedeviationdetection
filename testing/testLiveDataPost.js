/**
 * Test Script: Send POST requests to /livedata endpoint
 *
 * This script will:
 * 1. Send POST requests to /livedata
 * 2. Include test data (location, temperature, humidity)
 * 3. Log responses from the server
 */

const axios = require("axios");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const LIVEDATA_ENDPOINT = `${SERVER_URL}/livedata`;

console.log("📨 POST Request Test for /livedata\n");
console.log("Endpoint:", LIVEDATA_ENDPOINT);
console.log("================================\n");

// Test data
const testData = {
  latitude: 40.7128,
  longitude: -74.006,
  transmitid: "device-001",
  deviceId: "device-123",
  temperature: 25.5,
  humidity: 65.0,
  timestamp: new Date(),
};

console.log("📤 Sending test POST request...\n");
console.log("Request body:");
console.log(JSON.stringify(testData, null, 2));
console.log("\n⏳ Waiting for response...\n");

axios
  .post(LIVEDATA_ENDPOINT, testData, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 5000,
  })
  .then((response) => {
    console.log("✅ Server responded successfully!\n");
    console.log("Status Code:", response.status);
    console.log("Response:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log("\n✨ Test PASSED - POST request received successfully!");
      console.log("\n📊 Summary:");
      console.log("   ✓ Connection successful");
      console.log("   ✓ POST request sent successfully");
      console.log("   ✓ Server processed the data");
      console.log("   ✓ Server sent acknowledgment");
    } else {
      console.log("\n⚠️  Server returned error response");
    }
  })
  .catch((error) => {
    console.error("❌ Error sending request:\n");

    if (error.response) {
      // Server responded with error status
      console.error("Status Code:", error.response.status);
      console.error("Response:", error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("No response from server");
      console.error("Make sure server is running: npm run dev");
    } else {
      // Error in request setup
      console.error("Error:", error.message);
    }

    console.error("\nTroubleshooting:");
    console.error("1. Is server running? npm run dev");
    console.error("2. Check port 3000 is available");
    console.error("3. Check server logs for errors");
    console.error("4. Verify /livedata endpoint exists in server.js");

    process.exit(1);
  });
