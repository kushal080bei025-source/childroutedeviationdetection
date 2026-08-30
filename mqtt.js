const mqtt = require("mqtt");
const { sendNotification } = require("./SocketConsumer");
const { mqttLogin } = require("./controllers/authController");
const { fetchRoute } = require("./routes/mqtt_route_deviation");
const { onLiveGpsData } = require("./routes/on_live_gps_data");
const { fetchEmergencyContacts } = require("./routes/mqtt_emergency_contacts");
const {
  composeMqttMiddleware,
  mqttLogger,
  mqttJsonParser,
  mqttErrorHandler,
  mqttAuth,
} = require("./middleware/mqttMiddleware");

// ---------------------------------------------------------------------------
// SIM800L/ESP32 device connection via the free public HiveMQ test broker
// (no account/credentials). This is now the single MQTT client used for both
// app traffic (Notification, LocationUpdate, etc.) and the SIM800L device topics.
// ---------------------------------------------------------------------------
const SIM800L_BROKER_URL = "mqtt://broker.hivemq.com:1883";
// Must match the topics used in the ESP32 sketch

const sim800lClient = mqtt.connect(SIM800L_BROKER_URL, {
  clientId:
    "nodejs-backend-051199c9b9c441f2b7bb3dac14eeeb6f-" +
    Math.random().toString(16).slice(2, 8),
  clean: true,
  keepalive: 60,
  reconnectPeriod: 3000, // retry every 3s if disconnected
});

sim800lClient.on("connect", () => {
  console.log(`Connected to broker: ${SIM800L_BROKER_URL}`);
  sim800lClient.subscribe(
    [
      "Notification_051199c9b9c441f2b7bb3dac14eeeb6f",
      "RouteDeviationDetection_051199c9b9c441f2b7bb3dac14eeeb6f",
      "LocationUpdate_051199c9b9c441f2b7bb3dac14eeeb6f",
      "FetchMapData_051199c9b9c441f2b7bb3dac14eeeb6f",
      "Login_051199c9b9c441f2b7bb3dac14eeeb6f",
      "TestMessage_051199c9b9c441f2b7bb3dac14eeeb6f",
      "SendEmergencyContacts_051199c9b9c441f2b7bb3dac14eeeb6f",
      "MPUsensorstate_051199c9b9c441f2b7bb3dac14eeeb6f",
    ],
    (err) => {
      if (err) {
        console.error("Subscribe failed:", err.message);
      } else {
        console.log(
          `Subscribed to: Notification_051199c9b9c441f2b7bb3dac14eeeb6f, RouteDeviationDetection_051199c9b9c441f2b7bb3dac14eeeb6f, LocationUpdate_051199c9b9c441f2b7bb3dac14eeeb6f, FetchMapData_051199c9b9c441f2b7bb3dac14eeeb6f, Login_051199c9b9c441f2b7bb3dac14eeeb6f, TestMessage_051199c9b9c441f2b7bb3dac14eeeb6f,SendEmergencyContacts_051199c9b9c441f2b7bb3dac14eeeb6f `,
        );
      }
    },
  );
});

const mqttPipeline = composeMqttMiddleware([
  mqttErrorHandler((error, ctx) =>
    console.error("MQTT middleware error:", error.message, ctx.topic),
  ),
  mqttLogger,
  mqttJsonParser,
  mqttAuth,
  async (ctx) => {
    if (!ctx.dbUser) {
      if (ctx.topic !== "Login_051199c9b9c441f2b7bb3dac14eeeb6f") {
        console.warn("MQTT message received from unauthenticated user:", ctx);
      } else {
        console.log("Login message received:", ctx.data);
        const result = await mqttLogin(ctx.data);
        sim800lClient.publish(
          "LoginResponse_051199c9b9c441f2b7bb3dac14eeeb6f",
          JSON.stringify(result),
        );
        console.log("LoginResponse sent:", result);
      }
      return;
    }
    const { topic, data, dbUser } = ctx;
    switch (topic) {
      case "Notification_051199c9b9c441f2b7bb3dac14eeeb6f":
        sendNotification(dbUser._id, data.notification_type, global.io);
        console.log("Notification received:", data);
        break;
      case "MPUsensorstate_051199c9b9c441f2b7bb3dac14eeeb6f":
        console.log("MPUsensorstate received:", data);
        const stateExplanation = getStateExplanation(data.state);
        console.log("State explanation:", stateExplanation);
        break;
      case "RouteDeviationDetection_051199c9b9c441f2b7bb3dac14eeeb6f":
        console.log("Route Deviation Detection received:", data);
        break;
      case "LocationUpdate_051199c9b9c441f2b7bb3dac14eeeb6f":
        console.log("Location Update received:", data);
        await onLiveGpsData(ctx, sim800lClient);
        break;
      case "FetchMapData_051199c9b9c441f2b7bb3dac14eeeb6f":
        console.log("Fetch Map Data received:", data);
        await fetchRoute(ctx, sim800lClient);
        break;
      case "SendEmergencyContacts_051199c9b9c441f2b7bb3dac14eeeb6f":
        console.log("Emergency Contacts Request received:", data);
        await fetchEmergencyContacts(ctx, sim800lClient);
        break;
      case "TestMessage_051199c9b9c441f2b7bb3dac14eeeb6f":
        console.log("Test Message received:", data);
        break;
      default:
        console.warn("Unknown topic:", topic);
        break;
    }
  },
]);

sim800lClient.on("message", (topic, message) => {
  // SIM800L device data topic is handled directly; everything else goes through the app middleware pipeline

  mqttPipeline({ topic, raw: message });
});

sim800lClient.on("error", (err) => {
  console.error("MQTT Error:", err.message);
});

sim800lClient.on("reconnect", () => {
  console.log("Reconnecting to broker.hivemq.com...");
});

// Demo: ping the device 10 seconds after startup

// module.exports = sim800lClient;

function getStateExplanation(state) {
  switch (state) {
    case 0:
      return "Normal activity detected. No fall-related abnormal movement is observed.";

    case 1:
      return "Low acceleration detected, indicating a possible sudden downward movement.";

    case 2:
      return "Significant rotation detected, indicating a possible loss of balance.";

    case 3:
      return "Post-fall stillness detected. The person remains relatively motionless after abnormal movement.";

    case 4:
      return "Fall confirmed. An emergency notification should be triggered.";

    default:
      return "Unknown state.";
  }
}
