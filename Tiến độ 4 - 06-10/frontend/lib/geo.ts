import type { Car } from "./types";

export type MapPoint = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status?: string;
  plate?: string;
  location?: string;
};

const HANOI: [number, number] = [21.0285, 105.8542];

const HANOI_SPOTS: [number, number][] = [
  [21.028511, 105.854187],
  [21.0574, 105.8216],
  [21.0355, 105.8347],
  [21.0442, 105.8804],
  [21.0178, 105.8039],
  [21.0072, 105.8416],
];

const CITY_CENTER: Record<string, [number, number]> = {
  "ha noi": HANOI,
  "hà nội": HANOI,
  hanoi: HANOI,
  "da nang": [16.0544, 108.2022],
  "đà nẵng": [16.0544, 108.2022],
  "tp.hcm": [10.7769, 106.7009],
  "ho chi minh": [10.7769, 106.7009],
};

export function carToMapPoint(car: Car): MapPoint {
  if (car.latitude != null && car.longitude != null) {
    return {
      id: car.carId,
      name: car.carName,
      lat: car.latitude,
      lng: car.longitude,
      status: car.status,
      plate: car.licensePlate,
      location: car.location,
    };
  }

  const loc = (car.location || "").toLowerCase();
  const city = Object.entries(CITY_CENTER).find(([key]) => loc.includes(key));
  const isHanoi = !city || city[1] === HANOI;
  const [lat, lng] = isHanoi
    ? HANOI_SPOTS[(Math.max(car.carId, 1) - 1) % HANOI_SPOTS.length]
    : city![1];
  const drift = isHanoi ? 0 : ((car.carId % 5) - 2) * 0.006;

  return {
    id: car.carId,
    name: car.carName,
    lat: lat + drift,
    lng: lng + drift * 0.7,
    status: car.status,
    plate: car.licensePlate,
    location: car.location,
  };
}
