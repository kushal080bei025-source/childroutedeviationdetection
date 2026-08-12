const mqtt = require("mqtt");

const host = process.env.HIVEMQ_HOST;
const port = process.env.HIVEMQ_PORT || 8883;

const mqttUrl = `mqtts://${host}:${port}`;

const client = mqtt.connect(mqttUrl, {
  username: process.env.HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD,

  // HiveMQ Cloud uses TLS
  protocol: "mqtts",

  reconnectPeriod: 5000,
});

client.on("connect", () => {
  console.log("Connected to HiveMQ");

  client.subscribe("childtracker/device01/location", { qos: 0 }, (err) => {
    if (err) {
      console.error("MQTT subscription failed:", err);
    } else {
      console.log("Subscribed to childtracker/device01/location");
    }
  });
});

client.on("message", (topic, message) => {
  console.log("MQTT message received");
  console.log("Topic:", topic);
  console.log("Message:", message.toString());

  try {
    const data = JSON.parse(message.toString());

    console.log("Device ID:", data.deviceId);
    console.log("Latitude:", data.latitude);
    console.log("Longitude:", data.longitude);
  } catch (error) {
    console.error("Invalid JSON received:", error.message);
  }
});

client.on("error", (error) => {
  console.error("MQTT Error:", error.message);
});

client.on("reconnect", () => {
  console.log("Reconnecting to HiveMQ...");
});

module.exports = client;
