export type PickupStation = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
};

export const PICKUP_STATIONS: PickupStation[] = [
  { id: "hn-hoan-kiem", name: "Trạm Hoàn Kiếm", address: "36 Hàng Bài, Hoàn Kiếm, Hà Nội", city: "Hà Nội", lat: 21.0285, lng: 105.8542 },
  { id: "hn-ba-dinh", name: "Trạm Ba Đình", address: "1 Hoàng Hoa Thám, Ba Đình, Hà Nội", city: "Hà Nội", lat: 21.0355, lng: 105.8347 },
  { id: "hn-cau-giay", name: "Trạm Cầu Giấy", address: "Dương Khuê, Cầu Giấy, Hà Nội", city: "Hà Nội", lat: 21.035, lng: 105.794 },
  { id: "hn-ho-tay", name: "Trạm Hồ Tây", address: "Thanh Niên, Tây Hồ, Hà Nội", city: "Hà Nội", lat: 21.0574, lng: 105.8216 },
  { id: "hn-long-bien", name: "Trạm Long Biên", address: "Nguyễn Văn Cừ, Long Biên, Hà Nội", city: "Hà Nội", lat: 21.0442, lng: 105.8804 },
  { id: "hn-noi-bai", name: "Trạm Sân bay Nội Bài", address: "Nhà ga T1, Sân bay Nội Bài, Hà Nội", city: "Hà Nội", lat: 21.2187, lng: 105.8042 },
  { id: "dn-hai-chau", name: "Trạm Hải Châu", address: "Bạch Đằng, Hải Châu, Đà Nẵng", city: "Đà Nẵng", lat: 16.0678, lng: 108.2208 },
  { id: "dn-my-khe", name: "Trạm Mỹ Khê", address: "Võ Nguyên Giáp, Sơn Trà, Đà Nẵng", city: "Đà Nẵng", lat: 16.0597, lng: 108.2465 },
  { id: "dn-san-bay", name: "Trạm Sân bay Đà Nẵng", address: "Nhà ga T1, Sân bay Quốc tế Đà Nẵng", city: "Đà Nẵng", lat: 16.0439, lng: 108.1994 },
  { id: "dn-son-tra", name: "Trạm Sơn Trà", address: "Hoàng Sa, Sơn Trà, Đà Nẵng", city: "Đà Nẵng", lat: 16.0824, lng: 108.246 },
  { id: "hcm-q1", name: "Trạm Quận 1", address: "Nguyễn Huệ, Quận 1, TP.HCM", city: "TP.HCM", lat: 10.7769, lng: 106.7009 },
  { id: "hcm-tan-son-nhat", name: "Trạm Sân bay Tân Sơn Nhất", address: "Nhà ga T1, Tân Bình, TP.HCM", city: "TP.HCM", lat: 10.8188, lng: 106.6519 },
  { id: "hcm-q7", name: "Trạm Quận 7", address: "Nguyễn Văn Linh, Quận 7, TP.HCM", city: "TP.HCM", lat: 10.7295, lng: 106.7218 },
  { id: "hcm-thu-duc", name: "Trạm Thủ Đức", address: "Võ Văn Ngân, Thủ Đức, TP.HCM", city: "TP.HCM", lat: 10.8506, lng: 106.7718 },
];

export function stationLabel(station: PickupStation) {
  return `${station.name} — ${station.address}`;
}

export function cityKey(value?: string) {
  const text = (value || "").toLowerCase();
  if (text.includes("đà nẵng") || text.includes("da nang") || text.includes("danang")) return "Đà Nẵng";
  if (text.includes("hcm") || text.includes("hồ chí minh") || text.includes("ho chi minh") || text.includes("sài gòn") || text.includes("sai gon")) return "TP.HCM";
  if (text.includes("hà nội") || text.includes("ha noi") || text.includes("hanoi")) return "Hà Nội";
  return "";
}

export function stationsForCity(location?: string) {
  const city = cityKey(location);
  if (!city) return PICKUP_STATIONS;
  const matched = PICKUP_STATIONS.filter((item) => item.city === city);
  return matched.length ? matched : PICKUP_STATIONS;
}

export function findStationByLabel(label?: string) {
  if (!label) return null;
  return PICKUP_STATIONS.find((item) => stationLabel(item) === label || item.name === label || item.address === label) || null;
}
