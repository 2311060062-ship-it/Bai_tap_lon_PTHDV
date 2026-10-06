"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Filter,
  Fuel,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  CarFront,
  Award,
  Clock,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { CarCard } from "@/components/CarCard";
import { api } from "@/lib/api";
import { isElectric } from "@/lib/carUi";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Typewriter } from "@/components/Typewriter";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import type { Brand, Car, CarType } from "@/lib/types";

const HERO_IMG =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80";

type FuelFilter = "ALL" | "PETROL" | "ELECTRIC";

const TYPEWRITER_TEXTS = [
  "Sedan, SUV cao cấp",
  "Xe điện công nghệ mới",
  "Giao xe tận nơi",
  "Cọc 30% linh hoạt",
  "Bảo hiểm toàn diện",
];

export default function HomePage() {
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
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const petrolCount = cars.filter((c) => !isElectric(c)).length;
  const electricCount = cars.filter(isElectric).length;

  const visible = useMemo(() => {
    return cars.filter((car) => {
      const key = keyword.trim().toLowerCase();
      if (key && !`${car.carName} ${car.brandName} ${car.carTypeName}`.toLowerCase().includes(key))
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
    });
  }, [cars, keyword, brandId, carTypeId, fuel, priceBand]);

  const resetFilters = () => {
    setKeyword("");
    setBrandId("");
    setCarTypeId("");
    setPriceBand("");
    setFuel("ALL");
  };

  const isFiltered = !!keyword || !!brandId || !!carTypeId || !!priceBand || fuel !== "ALL";

  return (
    <div>
      {/* ====================================================
          HERO SECTION – Particle Canvas + Typewriter + Glowing Orbs
          ==================================================== */}
      <section className="relative min-h-[580px] overflow-hidden bg-navy-900">
        {/* Background Image */}
        <img
          src={HERO_IMG}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-navy-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f4f7fb] via-transparent to-transparent" />

        {/* Floating Particle Network – nhẹ hơn */}
        <ParticleCanvas count={35} />

        {/* Ambient Glowing Orbs – giảm opacity, kích thước nhỏ hơn */}
        <div
          className="pointer-events-none absolute -left-20 top-0 h-[350px] w-[350px] rounded-full opacity-15 animate-float-orb"
          style={{
            background: "radial-gradient(circle, rgba(45,91,255,0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 h-[280px] w-[280px] rounded-full opacity-12 animate-float-orb-2"
          style={{
            background: "radial-gradient(circle, rgba(245,197,66,0.35) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />

        {/* Hero Content */}
        <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-36 text-white">
          {/* Badge */}
          <div className="animate-hero-badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-bold backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-gold-400" />
            <span className="text-slate-100">Dịch vụ cho thuê xe tự lái chuẩn 5 sao</span>
            {/* Chấm tĩnh – không ping liên tục */}
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* Main Title */}
          <h1 className="animate-hero-title mt-7 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Trải Nghiệm <br />
            <span className="text-gradient-gold">Thuê Xe Cao Cấp</span>
          </h1>

          {/* Typewriter subtitle */}
          <div className="animate-fade-up delay-3 mt-5 flex items-center gap-3 text-lg text-slate-300 md:text-xl">
            <span>Đa dạng</span>
            <span className="text-gold-400 font-bold min-w-[200px]">
              <Typewriter
                texts={TYPEWRITER_TEXTS}
                typingSpeed={65}
                deletingSpeed={30}
                pauseMs={2000}
              />
            </span>
          </div>

          <p className="animate-fade-up delay-4 mt-4 max-w-lg text-sm text-slate-400 leading-relaxed">
            Đặt xe chỉ trong 2 phút, bảo hiểm toàn diện, giao xe tận nơi trên toàn quốc.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up delay-5 mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/cars"
              className="btn-shine group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 text-base font-bold text-white shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(45,91,255,0.6)]"
            >
              <CarFront className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              Khám phá xe ngay
              <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <span>4.9/5 • 2,500+ khách hàng tin tưởng</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up delay-6 mt-8 flex flex-wrap gap-4">
            {[
              { icon: ShieldCheck, text: "Bảo hiểm 2 chiều 100%" },
              { icon: Clock, text: "Xác nhận trong 5 phút" },
              { icon: ThumbsUp, text: "Hoàn tiền nếu hủy" },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 text-xs text-slate-300">
                <badge.icon className="h-4 w-4 text-emerald-400" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          STAT CARDS – Animated Counters
          ==================================================== */}
      <div className="relative z-10 mx-auto -mt-16 grid max-w-6xl gap-5 px-4 sm:grid-cols-3">
        {[
          {
            icon: Fuel,
            color: "from-blue-500/10 to-blue-600/5 border-blue-200/60 text-brand-500",
            iconBg: "bg-brand-50",
            count: petrolCount,
            label: "Xe Xăng Cao Cấp",
            sub: "Động cơ mạnh mẽ, tiết kiệm nhiên liệu",
            suffix: " xe",
          },
          {
            icon: Zap,
            color: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/60 text-emerald-600",
            iconBg: "bg-emerald-50",
            count: electricCount,
            label: "Xe Điện Thế Hệ Mới",
            sub: "Êm ái, thông minh, bảo vệ môi trường",
            suffix: " xe",
          },
          {
            icon: Award,
            color: "from-violet-500/10 to-violet-600/5 border-violet-200/60 text-violet-600",
            iconBg: "bg-violet-50",
            count: cars.length,
            label: "Tổng Xe Toàn Hệ Thống",
            sub: "Sedan, SUV, Crossover, Minivan",
            suffix: " xe",
          },
        ].map((item, idx) => (
          <div
            key={item.label}
            className={`reveal hover-lift flex items-center gap-5 rounded-3xl border bg-gradient-to-br ${item.color} bg-white p-6 shadow-card`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.iconBg} shadow-sm`}
            >
              <item.icon className="h-7 w-7" style={{ color: "inherit" }} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-navy-900">
                <AnimatedCounter target={item.count} suffix={item.suffix} duration={1600} />
              </p>
              <p className="text-sm font-bold text-navy-800">{item.label}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================
          FILTER & SEARCH
          ==================================================== */}
      <section className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="reveal rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm xe theo tên, hãng, loại... (Mercedes, VinFast, SUV...)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm outline-none transition duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
            {/* Fuel pills */}
            <div className="flex rounded-2xl bg-slate-100 p-1">
              {(["ALL", "PETROL", "ELECTRIC"] as FuelFilter[]).map((item) => {
                const active = fuel === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFuel(item)}
                    className={`rounded-xl px-5 py-2 text-xs font-bold transition-all duration-200 ${
                      active ? "bg-navy-900 text-white shadow-sm" : "text-slate-600 hover:text-navy-900"
                    }`}
                  >
                    {item === "ALL" ? "Tất cả" : item === "PETROL" ? "🔥 Xe Xăng" : "⚡ Xe Điện"}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                value: carTypeId,
                onChange: setCarTypeId,
                opts: types.map((t) => ({ v: String(t.carTypeId), l: t.typeName })),
                placeholder: "Tất cả kiểu dáng xe",
              },
              {
                value: brandId,
                onChange: setBrandId,
                opts: brands.map((b) => ({ v: String(b.brandId), l: b.brandName })),
                placeholder: "Tất cả hãng xe",
              },
              {
                value: priceBand,
                onChange: setPriceBand,
                opts: [
                  { v: "800", l: "Dưới 800.000đ / ngày" },
                  { v: "1500", l: "800K – 1.500.000đ / ngày" },
                  { v: "2500", l: "Trên 1.500.000đ / ngày" },
                ],
                placeholder: "Tất cả mức giá",
              },
            ].map((sel, i) => (
              <select
                key={i}
                value={sel.value}
                onChange={(e) => sel.onChange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white"
              >
                <option value="">{sel.placeholder}</option>
                {sel.opts.map((o) => (
                  <option key={o.v} value={o.v}>{o.l}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">Danh Sách Xe Cho Thuê</h2>
            <p className="mt-1 text-xs text-slate-500">
              Đang hiển thị{" "}
              <b className="text-brand-600">{visible.length}</b> phương tiện sẵn sàng phục vụ
            </p>
          </div>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-brand-600"
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

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-white p-4 shadow-card">
                <div className="h-48 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-5 w-2/3 rounded-lg bg-slate-200" />
                <div className="mt-2 h-4 w-1/2 rounded-lg bg-slate-200" />
                <div className="mt-4 h-10 rounded-2xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {visible.map((car) => (
              <div key={car.carId} className="reveal-scale">
                <CarCard car={car} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && visible.length === 0 && (
          <div className="animate-scale-spring rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500 animate-float">
              <Filter className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">Không tìm thấy xe nào</h3>
            <p className="mt-1 text-xs text-slate-500">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.
            </p>
            <button
              onClick={resetFilters}
              className="btn-shine mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition"
            >
              <RotateCcw className="h-4 w-4" /> Đặt lại bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* ====================================================
          WHY CHOOSE US – Scroll Reveal Section
          ==================================================== */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center reveal">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600">
              <Award className="h-4 w-4" />
              Tại sao chọn CarRental?
            </span>
            <h2 className="mt-4 text-4xl font-extrabold text-navy-900 md:text-5xl">
              Dịch Vụ Thuê Xe <span className="text-gradient-brand">Hàng Đầu</span>
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">
              Chúng tôi cung cấp trải nghiệm thuê xe hoàn hảo từ A đến Z – nhanh gọn, an toàn và minh bạch.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🚗",
                title: "Đa Dạng Xe",
                desc: "200+ phương tiện từ Sedan, SUV, Crossover đến Xe Điện cao cấp",
                delay: "0.05s",
                dir: "reveal",
              },
              {
                icon: "⚡",
                title: "Đặt Xe Siêu Tốc",
                desc: "Chỉ 2 phút để hoàn tất đặt xe trực tuyến, xác nhận ngay lập tức",
                delay: "0.15s",
                dir: "reveal",
              },
              {
                icon: "🛡️",
                title: "Bảo Hiểm 100%",
                desc: "Bảo hiểm 2 chiều toàn diện, an tâm cho mọi chuyến đi dù xa hay gần",
                delay: "0.25s",
                dir: "reveal",
              },
              {
                icon: "💰",
                title: "Cọc Linh Hoạt",
                desc: "Chỉ cần đặt cọc 30%, trả phần còn lại khi nhận xe hoặc trả đủ ngay",
                delay: "0.35s",
                dir: "reveal",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`${item.dir} group hover-lift flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-7 shadow-card text-center`}
                style={{ animationDelay: item.delay }}
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {item.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          CTA BANNER – Animated gradient background
          ==================================================== */}
      <section className="relative overflow-hidden py-20">
        {/* Background tĩnh – không animate để tránh lóa mắt */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #0a192f 0%, #0f2547 50%, #07111f 100%)" }}
        />
        {/* Orb nhẹ – opacity rất thấp */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-60 w-60 rounded-full opacity-10 animate-float-orb"
          style={{
            background: "radial-gradient(circle, #2d5bff 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 bottom-0 h-60 w-60 rounded-full opacity-10 animate-float-orb-2"
          style={{
            background: "radial-gradient(circle, #f5c542 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div className="reveal text-white">
            <h2 className="text-4xl font-extrabold md:text-5xl">
              Sẵn sàng cho chuyến đi{" "}
              {/* Bỏ animate-glow-pulse để không nhấp nháy liên tục */}
              <span className="text-gradient-gold">tiếp theo?</span>
            </h2>
            <p className="mt-4 text-slate-300 text-sm max-w-md mx-auto">
              Hàng trăm xe sang trọng đang chờ bạn – đặt xe ngay hôm nay và nhận ưu đãi đặc biệt!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/cars"
                className="btn-shine inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-400 px-8 py-4 text-sm font-bold text-navy-900 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-5 w-5" />
                Xem tất cả xe
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
