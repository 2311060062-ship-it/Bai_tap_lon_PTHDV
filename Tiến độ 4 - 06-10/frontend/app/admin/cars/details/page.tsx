"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { carStatusLabel, money } from "@/lib/labels";
import type { Car } from "@/lib/types";

export default function AdminCarDetailsPage() {
  const [items, setItems] = useState<Car[]>([]);

  useEffect(() => {
    api.get("/api/cars").then((res) => setItems(res.data)).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Chi tiết xe</h1>
      <p className="mt-1 text-sm text-slate-500">Thông số kỹ thuật và mô tả từng xe.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Xe</th>
              <th>Hãng</th>
              <th>Loại</th>
              <th>Nhiên liệu</th>
              <th>Động cơ</th>
              <th>Chỗ ngồi</th>
              <th>Giá</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.carId} className="border-t">
                <td className="px-4 py-3 font-medium">{item.carName}</td>
                <td>{item.brandName}</td>
                <td>{item.carTypeName}</td>
                <td>{item.fuelType || "—"}</td>
                <td>{item.engine || "—"}</td>
                <td>{item.seatCount ?? "—"}</td>
                <td>{money(item.price)}</td>
                <td>{carStatusLabel[item.status] || item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
