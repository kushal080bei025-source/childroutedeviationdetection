const mqtt = require("mqtt");
const accessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI4ZTI1NDQ1Mi04NmUwLTQxMzMtYTFlNy0wMTk0NmFmYmQ2NDEiLCJlbWFpbCI6Im5hYmluQGdtYWlsLmNvbSIsImlhdCI6MTc4ODA2NzE0OCwiZXhwIjoxNzg4MTUzNTQ4fQ.Ignv7IyI7BPm0z5ev-2OJqdgIEJQDzJAgbhE-mS1Jv8";
// ============================================================
// MQTT CONFIGURATION
// ============================================================

const BROKER_URL = "mqtt://broker.hivemq.com:1883";

const DEVICE_ID = "051199c9b9c441f2b7bb3dac14eeeb6f";

const client = mqtt.connect(BROKER_URL, {
  clientId: "mqtt-test-client-" + Math.random().toString(16).slice(2),
  clean: true,
  keepalive: 60,
  reconnectPeriod: 3000,
});

// ============================================================
// TOPICS
// ============================================================

const topics = {
  notification: `Notification_${DEVICE_ID}`,
  routeDeviation: `RouteDeviationDetection_${DEVICE_ID}`,
  locationUpdate: `LocationUpdate_${DEVICE_ID}`,
  fetchMapData: `FetchMapData_${DEVICE_ID}`,
  login: `Login_${DEVICE_ID}`,
  loginResponse: `LoginResponse_${DEVICE_ID}`,
  testMessage: `TestMessage_${DEVICE_ID}`,
  emergencyContacts: `SendEmergencyContacts_${DEVICE_ID}`,
  mpuSensorState: `MPUsensorstate_${DEVICE_ID}`,
};

// ============================================================
// CONNECT
// ============================================================

client.on("connect", () => {
  console.log("\n========================================");
  console.log(" MQTT TEST CLIENT CONNECTED");
  console.log("========================================");
  console.log("Broker:", BROKER_URL);
  console.log("Client ID:", client.options.clientId);
  console.log("");

  // Subscribe to all topics so responses can be monitored
  const subscribeTopics = [
    topics.notification,
    topics.routeDeviation,
    topics.locationUpdate,
    topics.fetchMapData,
    topics.login,
    topics.loginResponse,
    topics.testMessage,
    topics.emergencyContacts,
    topics.mpuSensorState,
  ];

  client.subscribe(subscribeTopics, (err, granted) => {
    if (err) {
      console.error("❌ Subscription failed:", err.message);
      return;
    }

    console.log("✅ Successfully subscribed to topics:");

    granted.forEach((item) => {
      console.log(`   → ${item.topic}`);
    });

    console.log("\n========================================");
    console.log(" STARTING CONNECTION TESTS");
    console.log("========================================\n");

    // Start tests after subscription
    runTests();
  });
});

// ============================================================
// RECEIVE MESSAGES
// ============================================================

client.on("message", (topic, message) => {
  console.log("\n📩 MESSAGE RECEIVED");
  console.log("----------------------------------------");
  console.log("Topic:", topic);

  try {
    const data = JSON.parse(message.toString());

    console.log("Data:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log("Raw Message:", message.toString());
  }

  console.log("----------------------------------------\n");
});

// ============================================================
// ERROR HANDLING
// ============================================================

client.on("error", (error) => {
  console.error("❌ MQTT ERROR:", error.message);
});

client.on("reconnect", () => {
  console.log("🔄 Reconnecting to MQTT broker...");
});

client.on("offline", () => {
  console.log("⚠️ MQTT Client Offline");
});

client.on("close", () => {
  console.log("🔌 MQTT Connection Closed");
});

// ============================================================
// PUBLISH HELPER
// ============================================================

function publishTest(topic, data, description) {
  console.log(`\n🚀 TEST: ${description}`);
  console.log("Topic:", topic);
  console.log("Payload:", JSON.stringify(data, null, 2));

  client.publish(topic, JSON.stringify(data), (error) => {
    if (error) {
      console.error(`❌ Failed: ${description}`, error.message);
    } else {
      console.log(`✅ Published: ${description}`);
    }
  });
}

// ============================================================
// RUN ALL TESTS
// ============================================================

function runTests() {
  let delay = 1000;

  // ----------------------------------------------------------
  // 1. TEST LOGIN
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // 2. TEST NOTIFICATION
  // ----------------------------------------------------------

  setTimeout(() => {
    publishTest(
      topics.notification,
      {
        notification_type: "fall_detected",
        message: "Test notification from client.js",
        accessToken: accessToken,
      },
      "Notification Connection",
    );
  }, delay);

  delay += 2000;

  // ----------------------------------------------------------
  // 3. TEST ROUTE DEVIATION
  // ----------------------------------------------------------

  setTimeout(() => {
    publishTest(
      topics.routeDeviation,
      {
        latitude: 27.7172,
        longitude: 85.324,
        deviated: true,
      },
      "Route Deviation Connection",
    );
  }, delay);

  delay += 2000;

  // ----------------------------------------------------------
  // 4. TEST LOCATION UPDATE
  // ----------------------------------------------------------

  setTimeout(() => {
    publishTest(
      topics.locationUpdate,
      {
        latitude: 27.7172,
        longitude: 85.324,
        velocity: 1.5,
        timestamp: Date.now(),
      },
      "Live GPS Location Connection",
    );
  }, delay);

  delay += 2000;

  // ----------------------------------------------------------
  // 5. TEST FETCH MAP DATA
  // ----------------------------------------------------------

  setTimeout(() => {
    publishTest(
      topics.fetchMapData,
      {
        request: "route",
      },
      "Fetch Route Connection",
    );
  }, delay);

  delay += 2000;

  // ----------------------------------------------------------
  // 6. TEST EMERGENCY CONTACTS
  // ----------------------------------------------------------

  setTimeout(() => {
    publishTest(
      topics.emergencyContacts,
      {
        request: "emergency_contacts",
      },
      "Emergency Contacts Connection",
    );
  }, delay);

  delay += 2000;

  // ----------------------------------------------------------
  // 7. TEST MPU SENSOR STATES
  // ----------------------------------------------------------

  const sensorStates = [
    {
      state: 0,
      name: "NORMAL",
    },
    {
      state: 1,
      name: "LOW_ACCELERATION",
    },
    {
      state: 2,
      name: "ROTATION",
    },
    {
      state: 3,
      name: "POST_FALL_STILLNESS",
    },
    {
      state: 4,
      name: "FALL_CONFIRMED",
    },
  ];

  sensorStates.forEach((sensorState, index) => {
    setTimeout(
      () => {
        publishTest(
          topics.mpuSensorState,
          {
            state: sensorState.state,
            stateName: sensorState.name,
            timestamp: Date.now(),
          },
          `MPU6050 Sensor State: ${sensorState.name}`,
        );
      },
      delay + index * 1500,
    );
  });

  delay += sensorStates.length * 1500 + 1000;

  // ----------------------------------------------------------
  // 8. TEST SIMPLE MESSAGE
  // ----------------------------------------------------------

  setTimeout(() => {
    publishTest(
      topics.testMessage,
      {
        message: "Hello from MQTT test client",
        timestamp: Date.now(),
      },
      "Test Message Connection",
    );
  }, delay);

  delay += 2000;

  // ----------------------------------------------------------
  // FINISH
  // ----------------------------------------------------------

  setTimeout(() => {
    console.log("\n========================================");
    console.log(" ALL MQTT TESTS COMPLETED");
    console.log("========================================\n");

    console.log("Check your backend terminal for:");
    console.log("✓ MQTT middleware logs");
    console.log("✓ Authentication logs");
    console.log("✓ GPS processing");
    console.log("✓ Route fetching");
    console.log("✓ Emergency contacts");
    console.log("✓ MPU sensor states");
    console.log("✓ Notification processing\n");
  }, delay);
}

// ============================================================
// MANUAL TEST FUNCTIONS
// ============================================================

// You can uncomment any of these for individual testing.

/*

// Test Fall Notification
setTimeout(() => {
  publishTest(
    topics.notification,
    {
      type: "fall_detected",
      message: "Child fall detected"
    },
    "Fall Detection Notification"
  );
}, 3000);

*/

/*

// Test GPS Update
setTimeout(() => {
  publishTest(
    topics.locationUpdate,
    {
      latitude: 27.7172,
      longitude: 85.3240,
      velocity: 2.5
    },
    "GPS Update"
  );
}, 3000);

*/
