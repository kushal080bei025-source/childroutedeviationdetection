const ParseRoute = (route, curlocation) => {
  let remainingdistance = 0;
  let closestindex = 0;
  if (curlocation) {
    closestindex = findClosestPointOnRoute(curlocation, route.points);
  }
  remainingdistance = totalRouteDistance(
    route.points.slice(closestindex, route.points.length),
  );
  let fraction = route.totalDistance / remainingdistance;
  remainingdur = route.estimatedDuration * fraction;
  return {
    id: route._id,
    name: route.name,
    routeIndex: route.routeIndex,
    direction: route.direction,
    points: route.points,
    estimatedDuration: route.estimatedDuration,
    totalDistance: route.totalDistance,
    estimatedRemainingTime: remainingdur,
    distanceRemaining: remainingdistance,
  };
};

function calculateDistance(start, end) {
  const R = 6371e3; // Earth's radius in meters

  const lat1 = (start.latitude * Math.PI) / 180;
  const lat2 = (end.latitude * Math.PI) / 180;
  const deltaLat = ((end.latitude - start.latitude) * Math.PI) / 180;
  const deltaLon = ((end.longitude - start.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
function totalRouteDistance(route) {
  let total = 0;

  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(route[i], route[i + 1]);
  }

  return total;
}
function latLngToXY(coord, origin) {
  const R = 6378137;

  const x =
    (((coord.longitude - origin.longitude) * Math.PI) / 180) *
    R *
    Math.cos((origin.latitude * Math.PI) / 180);

  const y = (((coord.latitude - origin.latitude) * Math.PI) / 180) * R;

  return { x, y };
}
function projectPointOnSegment(p, a, b) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;

  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const ab2 = abx * abx + aby * aby;

  let t = (apx * abx + apy * aby) / ab2;

  t = Math.max(0, Math.min(1, t));

  return {
    x: a.x + abx * t,
    y: a.y + aby * t,
    t,
  };
}
function findClosestPointOnRoute(currentLocation, route) {
  if (route.length < 2) return null;

  const origin = route[0];

  const currentXY = latLngToXY(currentLocation, origin);

  let minDistance = Number.MAX_VALUE;
  let closest = null;

  for (let i = 0; i < route.length - 1; i++) {
    const a = latLngToXY(route[i], origin);
    const b = latLngToXY(route[i + 1], origin);

    const projected = projectPointOnSegment(currentXY, a, b);

    const dx = currentXY.x - projected.x;
    const dy = currentXY.y - projected.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;

      closest = {
        index: i,
        nextIndex: i + 1,
        distance,
        projectedPoint: {
          latitude:
            route[i].latitude +
            (route[i + 1].latitude - route[i].latitude) * projected.t,
          longitude:
            route[i].longitude +
            (route[i + 1].longitude - route[i].longitude) * projected.t,
        },
      };
    }
  }

  return closest;
}
module.exports = { ParseRoute };
