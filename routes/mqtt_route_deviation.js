const { RouteEncoder } = require("../EncoderDecoder/main");
const User = require("../db/User.js");
const Route = require("../db/routes.js");
const UserCurrentDevice = require("../db/user_current_device.js");

// MQTT counterpart of GET /Fetch: encodes the device's route and publishes the binary packet back to the broker
async function fetchRoute(ctx, client) {
  const { dbUser } = ctx;

  try {
    const user = await User.findOne({ uid: dbUser.uid });
    let currentDevice = await UserCurrentDevice.findOne({ user: user._id })
      .populate("device")
      .lean();

    if (!currentDevice) {
      console.warn("FetchMapData: user has not purchased any devices.");
      return;
    }

    const device = currentDevice.device._id;
    const route = await Route.findOne({ device });

    if (!route) {
      console.warn("FetchMapData: route not found for device", device);
      return;
    }

    const encoder = new RouteEncoder(route.points);
    const pkg = encoder.encode();

    if (pkg.segments && pkg.segments.length > 0 && pkg.segments[0].deltaLat) {
      route.isUpdated = false;
      await route.save();
    }

    client.publish("FetchMapDataResponse", pkg.packet);
    console.log(
      "FetchMapData: published route packet,",
      pkg.segments.length,
      "segments",
    );
  } catch (error) {
    console.error("FetchMapData error:", error.message);
  }
}

module.exports = { fetchRoute };
