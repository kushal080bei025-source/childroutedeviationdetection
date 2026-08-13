const Route = require("./db/routes.js");

const { sendToUser } = require("./utils/pushNotifications");

const sendNotification = async (
  user,
  notification_type = "route_deviated",
  io,
) => {
  try {
    await sendToUser(user, io, {
      type: notification_type,
      title: "Route_Deviated",
      body: "Your route has deviated from the planned path.",
    });
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
