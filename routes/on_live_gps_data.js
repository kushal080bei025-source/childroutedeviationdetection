const UserCurrentDevice = require("../db/user_current_device.js");
const Route = require("../db/routes.js");
const Device = require("../db/deviceinfo.js");
const { updateRouteProgress } = require("../utils/routeProgress.js");

// MQTT counterpart of onLiveData in socketIo.js: broadcasts GPS over sockets, replies whether the device's route needs re-fetching
async function onLiveGpsData(ctx, client) {
  const { dbUser, data } = ctx;
  const io = global.io; // socket.io instance, set in server.js
  const { latitude, longitude, transmitid, speed, accuracy } = data;

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

    // GPS received: refresh lastSeenAt/lastLocation (velocity comes from the device's reported speed) and clear a stale "offline" status
    await Device.updateOne(
      { _id: currentDevice.device._id },
      {
        $set: {
          lastSeenAt: new Date(),
          status: "active",
          lastLocation: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: accuracy !== undefined ? parseFloat(accuracy) : undefined,
            speed: speed !== undefined ? parseFloat(speed) : undefined,
            updatedAt: new Date(),
          },
        },
      },
    );

    await updateRouteProgress(
      currentDevice.device._id,
      {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      speed !== undefined ? parseFloat(speed) : 0,
    );

    if (io && io.sockets && io.sockets.sockets) {
      console.log(
        "Sending Updated Location to client:",
        io.sockets.sockets.size,
        "sockets",
      );
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
      "LocationUpdateResponse_051199c9b9c441f2b7bb3dac14eeeb6f",
      JSON.stringify({ isUpdated: Boolean(route?.isUpdated), success: true }),
    );
  } catch (error) {
    console.error("LocationUpdate error:", error.message);
  }
}

module.exports = { onLiveGpsData };
