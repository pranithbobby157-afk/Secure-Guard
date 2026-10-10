import { SafeZone } from './types.ts';

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0; // Earth radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 100) / 100;
}

export function annotateSafeZonesWithDistance(
  safeZones: SafeZone[],
  userLat?: number | null,
  userLng?: number | null
): SafeZone[] {
  const hasUserCoords = userLat != null && userLng != null;

  const results: SafeZone[] = safeZones.map((sz) => {
    let distanceKm: number | null = null;
    if (hasUserCoords && typeof sz.latitude === 'number' && typeof sz.longitude === 'number') {
      distanceKm = haversineDistance(userLat!, userLng!, sz.latitude, sz.longitude);
    }
    return {
      ...sz,
      distance_km: distanceKm,
    };
  });

  if (hasUserCoords) {
    results.sort((a, b) => {
      const distA = a.distance_km ?? Infinity;
      const distB = b.distance_km ?? Infinity;
      return distA - distB;
    });
  }

  return results;
}
