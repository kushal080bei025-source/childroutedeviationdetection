const mqtt = require("mqtt");
const { sendNotification } = require("./SocketConsumer");
const { mqttLogin } = require("./controllers/authController");
const { fetchRoute } = require("./routes/mqtt_route_deviation");
const { onLiveGpsData } = require("./routes/on_live_gps_data");
const {
  composeMqttMiddleware,
  mqttLogger,
  mqttJsonParser,
  mqttErrorHandler,
  mqttAuth,
} = require("./middleware/mqttMiddleware");

const host = process.env.HIVEMQ_HOST;
const port = process.env.HIVEMQ_PORT || 8883;

const mqttUrl = `mqtts://${host}:${port}?clientId=childtracker_${Math.random().toString(16).slice(3)}`;

const client = mqtt.connect(mqttUrl, {
  username: process.env.HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD,

  // HiveMQ Cloud uses TLS
  protocol: "mqtts",

  reconnectPeriod: 5000,
});

client.on("connect", () => {
  console.log("Connected to HiveMQ");

  //frontend should receive FetchMapDataResponse, LoginResponse,LocationUpdateResponse

  client.subscribe(
    [
      "Notification",
      "RouteDeviationDetection",
      "LocationUpdate",
      "FetchMapData",
      "Login",
    ],
    { qos: 0 },
    (err) => {
      if (err) {
        console.error("MQTT subscription failed:", err);
      } else {
        console.log("Subscribed to RouteDeviationDetection");
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
      if (ctx.topic !== "Login") {
        console.warn(
          "MQTT message received from unauthenticated user:",
          ctx.topic,
        );
      } else {
        console.log("Login message received:", ctx.data);
        const result = await mqttLogin(ctx.data);
        client.publish("LoginResponse", JSON.stringify(result));
      }
      return;
    }
    const { topic, data, dbUser } = ctx;
    switch (topic) {
      case "Notification":
        sendNotification(dbUser._id, "route_deviated", global.io);
        console.log("Notification received:", data);
        break;
      case "RouteDeviationDetection":
        console.log("Route Deviation Detection received:", data);
        break;
      case "LocationUpdate":
        console.log("Location Update received:", data);
        await onLiveGpsData(ctx, client);
        break;
      case "FetchMapData":
        console.log("Fetch Map Data received:", data);
        await fetchRoute(ctx, client);
        break;
      default:
        console.warn("Unknown topic:", topic);
    }
  },
]);

function handleMqttMessage(topic, message) {
  mqttPipeline({ topic, raw: message, data: null, io: global.io });
}

client.on("message", handleMqttMessage);

client.on("error", (error) => {
  console.error("MQTT Error:", error.message);
});

client.on("reconnect", () => {
  console.log("Reconnecting to HiveMQ...");
});

module.exports = client;
