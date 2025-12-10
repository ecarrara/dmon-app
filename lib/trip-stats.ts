import type { GPSPosition } from "@/hooks/use-gps-tracking";

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total distance traveled in meters from position history
 */
export function calculateTotalDistance(positions: GPSPosition[]): number {
  if (positions.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];

    const distance = getDistanceInMeters(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );

    totalDistance += distance;
  }

  return totalDistance;
}

/**
 * Calculate average speed in m/s from position history
 * Only includes positions with valid speed readings
 */
export function calculateAverageSpeed(positions: GPSPosition[]): number {
  const validSpeeds = positions
    .map((p) => p.speed)
    .filter((speed): speed is number => speed !== null && speed >= 0);

  if (validSpeeds.length === 0) {
    return 0;
  }

  const sum = validSpeeds.reduce((acc, speed) => acc + speed, 0);
  return sum / validSpeeds.length;
}

/**
 * Calculate trip statistics from position history
 */
export function calculateTripStats(positions: GPSPosition[]) {
  return {
    totalDistance: calculateTotalDistance(positions),
    averageSpeed: calculateAverageSpeed(positions),
  };
}
