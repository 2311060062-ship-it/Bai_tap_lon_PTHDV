"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, Fuel, Heart, MapPin, Star, Users, Zap } from "lucide-react";
import type { Car } from "@/lib/types";
import { money } from "@/lib/labels";
import { mediaUrl } from "@/lib/media";
import { carBadge, carRating, carTags, isElectric } from "@/lib/carUi";
import { RentalCountdown } from "@/components/RentalCountdown";

const fallback =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80";

export function CarCard({ car }: { car: Car }) {
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const badge = carBadge(car);
  const rating = carRating(car);
  const tags = carTags(car);
  const oldPrice = car.price ? Math.round(Number(car.price) * 1.15) : null;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-brand-500/30 hover:shadow-lift"
    >
      <div>
        {/* Top Image Container */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-100">
          <img
            src={mediaUrl(car.imageUrl) || fallback}
            alt={car.carName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wide ${
              badge.rented
                ? "px-3.5 py-1.5 text-[13px] shadow-[0_6px_16px_rgba(225,29,72,0.45)]"
                : "px-3 py-1 text-xs shadow-md backdrop-blur-md"
            } transition-transform duration-300 group-hover:scale-105 ${badge.className}`}
          >
            {badge.rented && <Clock className="h-3.5 w-3.5" strokeWidth={2.6} />}
            {badge.label}
          </span>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setLiked((v) => !v);
            }}
            aria-label="Yêu thích xe"
            className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90"
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-200 ${
                liked ? "fill-rose-500 text-rose-500 animate-heart-pop" : "text-slate-500"
              }`}
            />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3.5 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-navy-900 transition-colors duration-200 group-hover:text-brand-600">
                {car.carName}
              </h3>
              <p className="text-xs font-medium text-slate-400">
                {car.carTypeName} • {car.brandName}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.score}
              <span className="font-normal text-slate-400">({rating.count})</span>
            </span>
          </div>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-brand-500 shrink-0" />
            <span className="truncate">{car.location || "Toàn quốc / Giao xe tận nơi"}</span>
          </p>

          {/* Specs Chips */}
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1 text-slate-600">
              <Users className="h-3.5 w-3.5 text-brand-500" /> {car.seatCount || 5} chỗ
            </span>
            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1 text-slate-600">
              {isElectric(car) ? (
                <Zap className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Fuel className="h-3.5 w-3.5 text-brand-500" />
              )}
              {car.fuelType || "Xăng"}
            </span>
            <span className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1 text-slate-600">
              Tự động
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-brand-50/60 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {car.status === "UNAVAILABLE" && car.rentedUntil && (
            <RentalCountdown until={car.rentedUntil} from={car.rentedFrom} />
          )}
        </div>
      </div>

      {/* Bottom Pricing & Actions */}
      <div className="border-t border-slate-100 bg-slate-50/40 p-5 pt-3.5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            {oldPrice && (
              <p className="text-xs text-slate-400 line-through">{money(oldPrice)}</p>
            )}
            <p className="text-xl font-extrabold text-brand-600">
              {car.price ? money(car.price) : "Liên hệ"}
              <span className="text-xs font-normal text-slate-400"> / ngày</span>
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Cọc 30%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/cars/${car.carId}`}
            className={`flex items-center justify-center gap-1 rounded-xl py-2.5 text-center text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 ${
              badge.rented
                ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "btn-shine bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:shadow-glow"
            }`}
          >
            {badge.rented ? "Xem giờ trống" : "Đặt ngay"}
          </Link>
          <Link
            href={`/cars/${car.carId}`}
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50/50"
          >
            Chi tiết <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
