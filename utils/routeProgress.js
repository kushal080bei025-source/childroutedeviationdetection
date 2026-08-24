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

  const thresholdSpeed = parseFloat(process.env.thresholdSpeed) || 1.4; // fallback to 1.4 m/s (5 km/h) if no average speed is available
  const estimatedRemainingDuration =
    averageSpeed > 0
      ? remainingDistance / averageSpeed
      : remainingDistance / thresholdSpeed;

  // Validate values before saving
  if (!isFinite(remainingDistance) || !isFinite(estimatedRemainingDuration)) {
    console.warn("Invalid route progress values - skipping save", {
      remainingDistance,
      estimatedRemainingDuration,
      averageSpeed,
    });
    return;
  }

  route.remainingDistance = remainingDistance;
  route.estimatedRemainingDuration = estimatedRemainingDuration;
  await route.save();
}

module.exports = { updateRouteProgress };
