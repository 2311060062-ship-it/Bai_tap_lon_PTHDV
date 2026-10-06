"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/geo";
import { carStatusLabel } from "@/lib/labels";

type Props = {
  points: MapPoint[];
  height?: string;
};

function markerIcon(status?: string) {
  const color =
    status === "AVAILABLE" ? "#2D5BFF" : status === "MAINTENANCE" ? "#F97316" : "#16A34A";
  return L.divIcon({
    className: "car-map-marker",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(15,23,42,.28)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
    </span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function FitPoints({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 150);
    if (!points.length) {
      map.setView([21.0285, 105.8542], 13);
      return () => window.clearTimeout(timer);
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return () => window.clearTimeout(timer);
    }
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    return () => window.clearTimeout(timer);
  }, [map, points]);

  return null;
}

export default function CarMap({ points, height = "520px" }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ height }}>
      <MapContainer
        center={[21.0285, 105.8542]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <FitPoints points={points} />
        {points.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={markerIcon(point.status)}>
            <Popup>
              <p className="font-semibold">{point.name}</p>
              {point.plate && <p>Biển số: {point.plate}</p>}
              {point.location && <p>{point.location}</p>}
              {point.status && <p>{carStatusLabel[point.status] || point.status}</p>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
