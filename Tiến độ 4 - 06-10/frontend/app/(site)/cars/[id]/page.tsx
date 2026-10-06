"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Fuel,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { getCurrentUser, needsEmailVerification } from "@/lib/auth";
import { money } from "@/lib/labels";
import { carRating, carTags, isElectric } from "@/lib/carUi";
import { BookingStepper } from "@/components/BookingStepper";
import { StationPicker } from "@/components/StationPicker";
import { saveCheckout } from "@/lib/checkout";
import { carToMapPoint } from "@/lib/geo";
import { mediaUrl } from "@/lib/media";
import {
  OFFICE_HOURS,
  after24h,
  availablePickupHours,
  combineDateTime,
  isOfficeHour,
  nextBookablePickup,
  plusDaysIso,
  rentalDays,
  todayIso,
} from "@/lib/rental";
import { carStatusLabel } from "@/lib/labels";
import { RentalCountdown } from "@/components/RentalCountdown";
import type { Car } from "@/lib/types";

const CarMap = dynamic(() => import("@/components/CarMap"), { ssr: false });

const fallback =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=80";

export default function CarDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const firstSlot = nextBookablePickup();
  const [pickupDate, setPickupDate] = useState(firstSlot.pickupDate);
  const [returnDate, setReturnDate] = useState(plusDaysIso(firstSlot.pickupDate, 1));
  const [slotMessage, setSlotMessage] = useState("");
  const [pickupTime, setPickupTime] = useState(firstSlot.pickupTime);
  const [returnTime, setReturnTime] = useState(firstSlot.pickupTime);
  const [pickupLocation, setPickupLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [payMode, setPayMode] = useState<"DEPOSIT" | "FULL">("DEPOSIT");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const minPickupDate = nextBookablePickup(new Date(nowTick)).pickupDate;
  const pickupHours = availablePickupHours(pickupDate, new Date(nowTick));

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const hours = availablePickupHours(pickupDate, new Date(nowTick));
    if (hours.includes(pickupTime as (typeof OFFICE_HOURS)[number])) return;
    const slot = nextBookablePickup(new Date(nowTick));
    const nextDate = hours.length ? pickupDate : slot.pickupDate;
    const nextTime = hours[0] || slot.pickupTime;
    setPickupDate(nextDate);
    setPickupTime(nextTime);
    setReturnTime(nextTime);
    const minReturn = plusDaysIso(nextDate, 1);
    setReturnDate((current) => (current > minReturn ? current : minReturn));
  }, [pickupDate, pickupTime, nowTick]);

  useEffect(() => {
    setLoggedIn(!!getCurrentUser());
    api
      .get(`/api/cars/${params.id}/features`)
      .then((res) => {
        setCar(res.data);
        try {
          const saved = JSON.parse(sessionStorage.getItem("rentalSearch") || "{}");
          setPickupLocation(saved.location || res.data.location || "");
          if (saved.pickupDate) setPickupDate(saved.pickupDate);
          if (saved.returnDate) setReturnDate(saved.returnDate);
        } catch {
          setPickupLocation(res.data.location || "");
        }
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  const photos = useMemo(() => {
    if (!car) return [fallback];
    const urls = [car.imageUrl, ...(car.images || [])].filter(Boolean) as string[];
    return urls.length ? Array.from(new Set(urls)) : [fallback];
  }, [car]);

  const summary = useMemo(() => {
    if (!pickupDate || !returnDate || !car?.price) return null;
    const start = combineDateTime(pickupDate, pickupTime);
    const end = combineDateTime(returnDate, returnTime);
    if (end <= start) return { error: "Giờ trả xe phải sau giờ nhận xe." };
    if (start.getTime() < Date.now() - 60_000) return { error: "Không đặt được khung giờ đã qua." };
    if (!isOfficeHour(pickupTime) || !isOfficeHour(returnTime)) {
      return { error: "Chỉ nhận/trả xe trong giờ hành chính 07:00 – 17:00." };
    }
    const days = rentalDays(pickupDate, returnDate);
    const total = days * Number(car.price);
    const deposit = Math.round(total * 0.3);
    return { days, total, deposit, pay: payMode === "FULL" ? total : deposit };
  }, [pickupDate, returnDate, pickupTime, returnTime, car, payMode]);

  useEffect(() => {
    if (!params.id || !pickupDate || !returnDate) return;
    const timer = window.setTimeout(() => {
      api
        .get(`/api/cars/${params.id}/availability`, {
          params: { pickupDate, returnDate, pickupTime, returnTime },
        })
        .then((res) => setSlotMessage(res.data.available ? "" : res.data.message))
        .catch(() => setSlotMessage(""));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [params.id, pickupDate, returnDate, pickupTime, returnTime]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!car) return;
    const current = getCurrentUser();
    if (!current) {
      router.push(`/login?next=/cars/${params.id}`);
      return;
    }
    if (needsEmailVerification(current)) {
      router.push(`/verify-email?email=${encodeURIComponent(current.email || "")}`);
      return;
    }
    if (summary && "error" in summary && summary.error) {
      setMessage(summary.error);
      return;
    }
    if (!summary || "error" in summary) {
      setMessage("Hãy chọn ngày nhận, ngày trả và giờ thuê xe.");
      return;
    }
    if (slotMessage) {
      setMessage(slotMessage);
      return;
    }
    if (car.status === "MAINTENANCE") {
      setMessage("Xe đang bảo trì, chưa thể đặt.");
      return;
    }
    saveCheckout({
      carId: car.carId,
      carName: car.carName,
      imageUrl: car.imageUrl,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      pickupLocation,
      notes,
      payMode,
      days: summary.days,
      total: summary.total,
      deposit: summary.deposit,
    });
    router.push(`/cars/${params.id}/payment`);
  };

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-slate-500">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="mt-4">Đang tải thông tin xe...</p>
      </div>
    );
  }

  const rating = carRating(car);
  const oldPrice = car.price ? Math.round(Number(car.price) * 1.25) : null;
  const photo = photos[index] || fallback;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8 animate-fade-in">
      <BookingStepper current={2} />

      <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.9fr]">
        {/* Left Column: Gallery & Details */}
        <section className="space-y-6">
          {/* Gallery Box */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="relative overflow-hidden rounded-2xl bg-slate-950">
              <img
                src={mediaUrl(photo) || fallback}
                alt={car.carName}
                className="h-[380px] w-full object-cover transition-all duration-500 hover:scale-102"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-800" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndex((i) => (i + 1) % photos.length)}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95"
                    aria-label="Ảnh sau"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-800" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      i === index
                        ? "border-brand-500 ring-2 ring-brand-500/30 scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={mediaUrl(url) || fallback}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Info & Specs */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
                  {car.carTypeName} • {car.brandName}
                </span>
                <h1 className="mt-2 text-3xl font-extrabold text-navy-900">{car.carName}</h1>
                {car.status === "UNAVAILABLE" && car.rentedUntil && (
                  <div className="mt-3 max-w-md">
                    <RentalCountdown until={car.rentedUntil} from={car.rentedFrom} />
                  </div>
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {rating.score}
                    <span className="font-normal text-slate-400">({rating.count} đánh giá)</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-brand-500" /> {car.location || "Liên hệ nhận xe"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                {oldPrice && (
                  <p className="text-xs text-slate-400 line-through">{money(oldPrice)}</p>
                )}
                <p className="text-3xl font-extrabold text-brand-600">
                  {car.price ? money(car.price) : "Liên hệ"}
                  <span className="text-sm font-normal text-slate-400"> / ngày</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-navy-900">Mô tả xe</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {car.description ||
                  `${car.carName} là lựa chọn lý tưởng với phong cách thiết kế hiện đại, nội thất sang trọng, vận hành êm ái và hệ thống an toàn đạt chuẩn cho mọi chuyến hành trình.`}
              </p>
            </div>

            {/* Key Specs Grid */}
            <div>
              <h3 className="font-bold text-navy-900">Thông số kỹ thuật</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                {[
                  ["Số chỗ ngồi", `${car.seatCount || 5} Chỗ`],
                  ["Nhiên liệu", car.fuelType || "Xăng"],
                  ["Động cơ", car.engine || "Tự động"],
                  ["Màu sắc", car.color || "Tiêu chuẩn"],
                  ["Năm sản xuất", car.year || "2023"],
                  ["Hộp số", "Tự động (AT)"],
                  ["Biển số", car.licensePlate || "Đã đăng ký"],
                  ["Bảo hiểm", "2 chiều 100%"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="text-slate-400">{label}</p>
                    <p className="mt-1 font-bold text-navy-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup Map Location */}
            <div>
              <h3 className="flex items-center gap-2 font-bold text-navy-900">
                <MapPin className="h-4 w-4 text-brand-500" /> Vị trí xe & Điểm nhận
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {car.location || "Hỗ trợ giao xe tận nơi tại các quận nội thành"}
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <CarMap points={[carToMapPoint(car)]} height="280px" />
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Sticky Booking Card */}
        <aside className="sticky top-24 space-y-5">
          {/* Quick Support Badge */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white font-black shadow-glow">
                CR
              </span>
              <div>
                <p className="font-bold text-navy-900">Tổng Đài Đặt Xe Nhanh</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9/5 • Hỗ trợ 24/7
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-500" /> Xác nhận tức thì
              </span>
              <a href="tel:19006868" className="font-bold text-brand-600 hover:underline">
                1900 6868
              </a>
            </div>
          </div>

          {/* Booking Form Card */}
          <form
            onSubmit={submit}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lift space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-extrabold text-navy-900">Lịch Trình Thuê Xe</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  car.status === "AVAILABLE"
                    ? "bg-emerald-50 text-emerald-600"
                    : car.status === "MAINTENANCE"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {carStatusLabel[car.status] || (car.status === "AVAILABLE" ? "Có sẵn" : car.status)}
              </span>
            </div>
            {car.status === "UNAVAILABLE" && car.rentedUntil && (
              <RentalCountdown until={car.rentedUntil} from={car.rentedFrom} />
            )}

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-700">
                Ngày nhận xe
                <input
                  type="date"
                  required
                  min={minPickupDate}
                  value={pickupDate}
                  onChange={(e) => {
                    const next = e.target.value < minPickupDate ? minPickupDate : e.target.value;
                    const hours = availablePickupHours(next);
                    const time = hours.includes(pickupTime as (typeof OFFICE_HOURS)[number]) ? pickupTime : hours[0] || OFFICE_HOURS[0];
                    setPickupDate(next);
                    setPickupTime(time);
                    const slot = after24h(next, time);
                    setReturnDate(returnDate > slot.returnDate ? returnDate : slot.returnDate);
                    setReturnTime(time);
                  }}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-brand-500 focus:bg-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Ngày trả xe
                <input
                  type="date"
                  required
                  min={plusDaysIso(pickupDate || todayIso(), 1)}
                  value={returnDate}
                  onChange={(e) => {
                    const minReturn = plusDaysIso(pickupDate, 1);
                    setReturnDate(e.target.value < minReturn ? minReturn : e.target.value);
                    setReturnTime(pickupTime);
                  }}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-brand-500 focus:bg-white"
                />
              </label>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-700">
                Giờ nhận
                <select
                  value={pickupTime}
                  onChange={(e) => {
                    const next = e.target.value;
                    setPickupTime(next as (typeof OFFICE_HOURS)[number]);
                    const slot = after24h(pickupDate, next);
                    setReturnDate((current) => (current > slot.returnDate ? current : slot.returnDate));
                    setReturnTime(next as (typeof OFFICE_HOURS)[number]);
                  }}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-brand-500 focus:bg-white"
                >
                  {pickupHours.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <span className="mt-1 block text-[11px] text-slate-400">
                  {pickupDate === todayIso()
                    ? `Chỉ còn giờ chưa qua · 07:00 – 17:00`
                    : "Giờ hành chính 07:00 – 17:00"}
                </span>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Giờ trả
                <select
                  value={returnTime}
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-600"
                >
                  {OFFICE_HOURS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <span className="mt-1 block text-[11px] font-medium text-brand-600">Tự chỉnh đúng 24 giờ sau giờ nhận</span>
              </label>
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Địa điểm nhận xe
              </label>
              <StationPicker
                value={pickupLocation}
                cityHint={car.location}
                onChange={setPickupLocation}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ghi chú thêm (tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Yêu cầu thêm ghế trẻ em, thời gian giao xe đặc biệt..."
                className="min-h-[64px] w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs outline-none transition focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Payment Mode Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMode("DEPOSIT")}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-200 ${
                    payMode === "DEPOSIT"
                      ? "border-brand-500 bg-brand-50/80 text-brand-600 shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xs font-bold">Đặt cọc 30%</span>
                  <span className="text-[10px] text-slate-400">Trả phần còn lại khi nhận xe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayMode("FULL")}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-200 ${
                    payMode === "FULL"
                      ? "border-brand-500 bg-brand-50/80 text-brand-600 shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xs font-bold">Thanh toán 100%</span>
                  <span className="text-[10px] text-slate-400">Trả toàn bộ ngay</span>
                </button>
              </div>
            </div>

            {/* Live Pricing Breakdown */}
            {summary && !("error" in summary) && (
              <div className="animate-fade-in rounded-2xl border border-brand-100 bg-brand-50/50 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Thời gian thuê:</span>
                  <span className="font-semibold">{summary.days} ngày</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tổng tiền thuê:</span>
                  <span className="font-semibold">{money(summary.total)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-200/60 pt-2 text-sm font-bold text-brand-600">
                  <span>Số tiền cần trả ngay:</span>
                  <span>{money(summary.pay)}</span>
                </div>
              </div>
            )}

            {(message || slotMessage) && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-200">
                {message || slotMessage}
              </div>
            )}
            {car.status === "UNAVAILABLE" && !slotMessage && (
              <p className="text-xs text-amber-700">
                Xe đang được thuê. Hết giờ thì đặt lại được, hoặc chọn khung sau giờ trả.
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!!slotMessage || car.status === "MAINTENANCE"}
              className="btn-shine w-full rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-center text-sm font-bold text-white shadow-glow transition duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {car.status === "MAINTENANCE"
                ? "Xe đang bảo trì"
                : slotMessage
                  ? "Khung giờ đã được đặt"
                  : loggedIn
                    ? "Tiến hành thanh toán"
                    : "Đăng nhập để đặt xe"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
