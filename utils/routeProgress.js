const Route = require("../db/routes.js");
const {
  findClosestPointOnRoute,
  totalRouteDistance,
} = require("../parsers/parseRoute.js");

// Recomputes remaining distance/time to the end of the route using the device's current (last reported) location.
async function updateRouteProgress(deviceId, currentLocation, averageSpeed) {
  if (
    !deviceId ||
    !currentLocation ||
    currentLocation.latitude == null ||
    currentLocation.longitude == null
  ) {
    return;
  }

  const route = await Route.findOne({ device: deviceId });
  if (!route || !Array.isArray(route.points) || route.points.length < 2) {
    return;
  }

  const closest = findClosestPointOnRoute(currentLocation, route.points);
  if (!closest) {
    return;
  }

  const remainingDistance = totalRouteDistance([
    currentLocation,
    ...route.points.slice(closest.nextIndex),
  ]);

  const estimatedRemainingDuration =
    averageSpeed > 0
      ? remainingDistance / averageSpeed
      : remainingDistance / process.env.thresholdSpeed; // fallback to 1.4 m/s (5 km/h) if no average speed is available
  route.remainingDistance = remainingDistance;
  route.estimatedRemainingDuration = estimatedRemainingDuration;
  await route.save();
}

module.exports = { updateRouteProgress };
