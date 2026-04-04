export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function formatPrice(npr: number): string {
  return `रु ${npr.toLocaleString("en-NP")}`;
}

export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

export function rankHotels(
  hotels: { distance?: number; average_rating?: number; review_count?: number; status: string }[]
) {
  return [...hotels].sort((a, b) => {
    const scoreA = getScore(a);
    const scoreB = getScore(b);
    return scoreB - scoreA;
  });
}

function getScore(hotel: { distance?: number; average_rating?: number; review_count?: number; status: string }): number {
  const distScore = hotel.distance != null ? Math.max(0, 10 - hotel.distance) : 5;
  const ratingScore = (hotel.average_rating ?? 3) * 2;
  const reviewScore = Math.min((hotel.review_count ?? 0) / 50, 2);
  const verifiedBonus = hotel.status === "verified" ? 3 : 0;
  return distScore + ratingScore + reviewScore + verifiedBonus;
}
