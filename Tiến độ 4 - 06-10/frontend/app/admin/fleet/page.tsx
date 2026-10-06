"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CarFront } from "lucide-react";
import { api } from "@/lib/api";
import { carToMapPoint } from "@/lib/geo";
import { carStatusLabel, money } from "@/lib/labels";
import { RentalCountdown } from "@/components/RentalCountdown";
import type { Car } from "@/lib/types";

const CarMap = dynamic(() => import("@/components/CarMap"), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-2xl bg-slate-100" />,
});

type Tab = "overview" | "tracking" | "usage";

export default function AdminFleetPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [tab, setTab] = useState<Tab>("tracking");

  useEffect(() => {
    api.get("/api/cars").then((res) => setCars(res.data)).catch(() => setCars([]));
  }, []);

  const points = useMemo(() => cars.map(carToMapPoint), [cars]);
  const available = cars.filter((car) => car.status === "AVAILABLE").length;
  const rented = cars.filter((car) => car.status === "UNAVAILABLE").length;
  const maintenance = cars.filter((car) => car.status === "MAINTENANCE").length;

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold" style={{ color: "#2D5BFF" }}>
        <CarFront className="h-6 w-6" /> Quản lý đội xe
      </h1>
      <p className="mt-1 text-sm text-slate-500">Quản lý & theo dõi đội xe theo thời gian thực</p>

      <div className="mt-5 flex gap-2 rounded-xl bg-slate-100 p-1 text-sm font-medium">
        {[
          ["overview", "Tổng quan"],
          ["tracking", "Theo dõi"],
          ["usage", "Sử dụng"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as Tab)}
            className={`flex-1 rounded-lg px-4 py-2 ${tab === id ? "bg-white text-[#2D5BFF] shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "tracking" && (
        <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Theo dõi trực tiếp</h2>
          <p className="mt-1 text-sm text-slate-500">Xem vị trí xe trên bản đồ</p>
          <div className="mt-4">
            <CarMap points={points} />
          </div>
        </section>
      )}

      {tab === "overview" && (
        <section className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Còn xe", available, "#2D5BFF"],
              ["Đang thuê", rented, "#16A34A"],
              ["Bảo trì", maintenance, "#F97316"],
            ].map(([label, count, color]) => (
              <div key={String(label)} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold" style={{ color: String(color) }}>{count}</p>
              </div>
            ))}
          </div>
          <FleetTable cars={cars} />
        </section>
      )}

      {tab === "usage" && (
        <section className="mt-5 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Sử dụng đội xe</h2>
          <p className="mt-1 text-sm text-slate-500">Tỷ lệ theo trạng thái hiện tại.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Còn xe", available, cars.length],
              ["Đang thuê", rented, cars.length],
              ["Bảo trì", maintenance, cars.length],
            ].map(([label, count, total]) => {
              const pct = Number(total) ? Math.round((Number(count) / Number(total)) * 100) : 0;
              return (
                <div key={String(label)} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{pct}%</p>
                  <p className="text-xs text-slate-400">{count}/{total} xe</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <FleetTable cars={cars} />
          </div>
        </section>
      )}
    </div>
  );
}

function FleetTable({ cars }: { cars: Car[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3">Xe</th>
            <th>Hãng</th>
            <th>Biển số</th>
            <th>Vị trí</th>
            <th>Trạng thái</th>
            <th>Còn lại</th>
            <th>Giá / ngày</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.carId} className="border-t">
              <td className="px-4 py-3 font-medium">{car.carName}</td>
              <td>{car.brandName}</td>
              <td>{car.licensePlate || "—"}</td>
              <td>{car.location}</td>
              <td>{carStatusLabel[car.status] || car.status}</td>
              <td>
                {car.status === "UNAVAILABLE" && car.rentedUntil ? (
                  <RentalCountdown until={car.rentedUntil} from={car.rentedFrom} compact />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td>{money(car.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
