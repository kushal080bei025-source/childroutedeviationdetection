const UserCurrentDevice = require("./db/user_current_device.js");
const Route = require("./db/routes.js");
const Device = require("./db/deviceinfo.js");
const { updateRouteProgress } = require("./utils/routeProgress.js");

const { sendToUser } = require("./utils/pushNotifications");

const sendNotification = async (
  notification_type = "route_deviated",
  req,
  res,
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
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const onLiveData = async (io, user, data) => {
  const { latitude, longitude, transmitid, speed, accuracy } = data;

  const currentDevice = await UserCurrentDevice.findOne({
    user: user._id,
  })
    .populate("device")
    .lean();
  let route = await Route.findOne({ device: currentDevice.device._id });
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

  await updateRouteProgress(currentDevice.device._id, {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  });

  if (io && io.sockets && io.sockets.sockets) {
    const sockets = io.sockets.sockets;
    console.log(sockets.size, "connected clients");
    for (const [id, socket] of sockets) {
      socket.emit("location-update", {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        transmitid,
        deviceId: currentDevice?.device?._id,
      });
    }
  }
  return route?.isUpdated;
};
const tesTing = async (io, data = {}) => {
  // Log the entire data object to debug
  //   console.log("📍 Received data object:", JSON.stringify(data, null, 2));

  // Safe destructuring with defaults
  const latitude = data.latitude;
  const longitude = data.longitude;
  const transmitid = data.transmitid;
  const deviceId = data.deviceId;
  // Get all connected sockets from Socket.IO
  if (io && io.sockets && io.sockets.sockets) {
    const sockets = io.sockets.sockets;

    for (const [id, socket] of sockets) {
      socket.emit("location-update", {
        latitude,
        longitude,
        transmitid,
        deviceId,
      });
    }
    // console.log(
    //   `✅ Broadcasted location update to ${sockets.size} connected clients`,
    // );
  } else {
    console.log("⚠️  No Socket.IO sockets available");
  }
};

module.exports = {
  onLiveData,
  tesTing,
  sendNotification,
};
