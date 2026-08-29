const Route = require("./db/routes.js");

const { sendToUser } = require("./utils/pushNotifications");

const sendNotification = async (
  user,
  notification_type = "route_deviated",
  io,
) => {
  try {
    switch (notification_type) {
      case "route_deviated":
        await sendToUser(user, io, {
          type: notification_type,
          title: "Route Deviated",
          body: "Your route has deviated from the planned path.",
        });
        break;
      case "fall_detected":
        await sendToUser(user, io, {
          type: notification_type,
          title: "Fall Detected",
          body: "Your child has fallen.",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
  }
};
module.exports = {
  sendNotification,
  onLiveData: async (io, user, data) => {
    const { latitude, longitude, transmitid } = data;
  },
};
