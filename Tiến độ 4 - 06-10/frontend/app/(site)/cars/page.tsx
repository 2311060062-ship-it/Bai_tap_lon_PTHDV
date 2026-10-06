"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import { CarCard } from "@/components/CarCard";
import { api } from "@/lib/api";
import { isElectric } from "@/lib/carUi";
import type { Brand, Car, CarType } from "@/lib/types";

type FuelFilter = "ALL" | "PETROL" | "ELECTRIC";

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<CarType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [brandId, setBrandId] = useState("");
  const [carTypeId, setCarTypeId] = useState("");
  const [priceBand, setPriceBand] = useState("");
  const [fuel, setFuel] = useState<FuelFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/api/cars"), api.get("/api/brands"), api.get("/api/car-types")])
      .then(([carRes, brandRes, typeRes]) => {
        setCars(carRes.data);
        setBrands(brandRes.data);
        setTypes(typeRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được danh sách xe"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      cars.filter((car) => {
        const key = keyword.trim().toLowerCase();
        if (
          key &&
          !`${car.carName} ${car.brandName} ${car.carTypeName}`.toLowerCase().includes(key)
        )
          return false;
        if (brandId && String(car.brandId) !== brandId) return false;
        if (carTypeId && String(car.carTypeId) !== carTypeId) return false;
        if (fuel === "ELECTRIC" && !isElectric(car)) return false;
        if (fuel === "PETROL" && isElectric(car)) return false;
        const price = Number(car.price || 0);
        if (priceBand === "800" && price > 800000) return false;
        if (priceBand === "1500" && (price < 800000 || price > 1500000)) return false;
        if (priceBand === "2500" && price < 1500000) return false;
        return true;
      }),
    [cars, keyword, brandId, carTypeId, fuel, priceBand]
  );

  const resetFilters = () => {
    setKeyword("");
    setBrandId("");
    setCarTypeId("");
    setPriceBand("");
    setFuel("ALL");
  };

  const isFiltered = !!keyword || !!brandId || !!carTypeId || !!priceBand || fuel !== "ALL";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Bộ sưu tập xe hiện đại
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 md:text-4xl">Danh Sách Xe Cho Thuê</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lựa chọn phương tiện phù hợp với hành trình của bạn với mức giá ưu đãi nhất
          </p>
        </div>
      </div>

      {/* Filter Box */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm xe theo tên, hãng hoặc loại..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-sm outline-none transition duration-200 focus:border-brand-500 focus:bg-white"
            />
          </div>
          <div className="flex rounded-2xl bg-slate-100 p-1">
            {(["ALL", "PETROL", "ELECTRIC"] as FuelFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFuel(item)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  fuel === item
                    ? "bg-navy-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-navy-900"
                }`}
              >
                {item === "ALL" ? "Tất cả" : item === "PETROL" ? "Xe Xăng" : "Xe Điện"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <select
            value={carTypeId}
            onChange={(e) => setCarTypeId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white"
          >
            <option value="">Tất cả loại xe</option>
            {types.map((type) => (
              <option key={type.carTypeId} value={type.carTypeId}>
                {type.typeName}
              </option>
            ))}
          </select>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white"
          >
            <option value="">Tất cả hãng</option>
            {brands.map((brand) => (
              <option key={brand.brandId} value={brand.brandId}>
                {brand.brandName}
              </option>
            ))}
          </select>
          <select
            value={priceBand}
            onChange={(e) => setPriceBand(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white"
          >
            <option value="">Tất cả giá</option>
            <option value="800">Dưới 800.000đ</option>
            <option value="1500">800.000đ - 1.500.000đ</option>
            <option value="2500">Trên 1.500.000đ</option>
          </select>
        </div>
      </div>

      {/* Result Status */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Tìm thấy <b className="text-brand-600">{visible.length}</b> xe phù hợp
        </p>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-brand-600"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Xóa bộ lọc
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Grid of Cars */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-white p-4 shadow-card">
              <div className="h-48 rounded-2xl bg-slate-200" />
              <div className="mt-4 h-5 w-2/3 rounded-lg bg-slate-200" />
              <div className="mt-2 h-4 w-1/3 rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((car) => (
            <CarCard key={car.carId} car={car} />
          ))}
        </div>
      )}

      {/* Empty Filter State */}
      {!loading && !error && visible.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Filter className="h-7 w-7" />
          </div>
          <h3 className="mt-3 text-base font-bold text-navy-900">Không tìm thấy xe nào</h3>
          <p className="mt-1 text-xs text-slate-500">
            Hãy thử thay đổi điều kiện tìm kiếm hoặc bấm đặt lại bộ lọc.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
