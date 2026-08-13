const UserCurrentDevice = require("../db/user_current_device.js");
const Route = require("../db/routes.js");

// MQTT counterpart of onLiveData in socketIo.js: broadcasts GPS over sockets, replies whether the device's route needs re-fetching
async function onLiveGpsData(ctx, client) {
  const { dbUser, data, io } = ctx;
  const { latitude, longitude, transmitid } = data;

  try {
    const currentDevice = await UserCurrentDevice.findOne({ user: dbUser._id })
      .populate("device")
      .lean();

    if (!currentDevice) {
      console.warn("LocationUpdate: user has not purchased any devices.");
      return;
    }

    const route = await Route.findOne({ device: currentDevice.device._id });
    console.log("GPS:", latitude, longitude, transmitid, route?.isUpdated);

    if (io && io.sockets && io.sockets.sockets) {
      const sockets = io.sockets.sockets;
      for (const [id, socket] of sockets) {
        socket.emit("location-update", {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          transmitid,
          deviceId: currentDevice.device._id,
        });
      }
    }

    client.publish(
      "LocationUpdateResponse",
      JSON.stringify({ isUpdated: Boolean(route?.isUpdated) }),
    );
  } catch (error) {
    console.error("LocationUpdate error:", error.message);
  }
}

module.exports = { onLiveGpsData };
