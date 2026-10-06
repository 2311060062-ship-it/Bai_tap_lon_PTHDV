import type { Car } from "./types";

export const isElectric = (car: Car) =>
  (car.fuelType || "").toLowerCase().includes("điện") || (car.fuelType || "").toLowerCase().includes("dien");

export function carBadge(car: Car) {
  if (car.status === "UNAVAILABLE") {
    return { label: "Đang thuê", className: "bg-rose-600 text-white ring-2 ring-white shadow-lg", rented: true };
  }
  if (car.status === "MAINTENANCE") {
    return { label: "Bảo trì", className: "bg-orange-500 text-white ring-2 ring-white shadow-lg", rented: false };
  }
  if (isElectric(car)) return { label: "Thân thiện môi trường", className: "bg-emerald-500 text-white", rented: false };
  if ((car.price || 0) <= 800000) return { label: "Tiết kiệm", className: "bg-sky-500 text-white", rented: false };
  if ((car.brandName || "").toLowerCase().includes("mercedes")) return { label: "Phổ biến", className: "bg-navy-800 text-white", rented: false };
  return { label: "Phổ biến", className: "bg-navy-800 text-white", rented: false };
}

export function carTags(car: Car) {
  const tags = ["Điều hòa"];
  if (car.carTypeName === "SUV" || car.carTypeName === "Pickup") tags.push("GPS");
  tags.push("Camera lùi");
  if ((car.brandName || "").toLowerCase().includes("mercedes") || isElectric(car)) tags.push("Autopilot");
  return tags.slice(0, 4);
}

export function carRating(car: Car) {
  const score = (4.6 + ((car.carId || 1) % 4) * 0.1).toFixed(1);
  const count = 80 + (car.carId || 1) * 11;
  return { score, count };
}
