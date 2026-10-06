"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, BarChart3, CalendarPlus, CarFront,
  FileBarChart, RefreshCw, TrendingDown, TrendingUp, UserPlus,
} from "lucide-react";
import { api } from "@/lib/api";
import { money } from "@/lib/labels";
import type { Car, Dashboard } from "@/lib/types";

/* ── Animated counter ─────────────────────────────── */
function Counter({ target, prefix = "", suffix = "" }: { target: number | string; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const numeric = typeof target === "number";

  useEffect(() => {
    if (!numeric) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const t0 = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * (target as number)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, numeric]);

  return <span ref={ref}>{prefix}{numeric ? val : target}{suffix}</span>;
}

/* ── Dark Donut chart ─────────────────────────────── */
function Donut({ percent, label, count, color, glow }: {
  percent: number; label: string; count: number; color: string; glow: string;
}) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        {/* Track */}
        <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
        {/* Progress */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${color} ${p}%, rgba(255,255,255,0.06) ${p}%)` }} />
        {/* Center */}
        <div className="absolute inset-2.5 flex flex-col items-center justify-center rounded-full"
          style={{ background: "#0d1f35", boxShadow: `inset 0 0 12px rgba(0,0,0,0.3)` }}>
          <span className="text-base font-extrabold text-white">{p}%</span>
        </div>
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-full opacity-25"
          style={{ boxShadow: `0 0 18px ${glow}` }} />
      </div>
      <p className="mt-3 text-xs font-bold text-slate-300">{label}</p>
      <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>{count} xe</p>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: number | string;
  hint: string;
  delta: string;
  up: boolean;
  accent: string;
  glow: string;
  icon: React.ReactNode;
  delay: number;
}

function StatCard({ title, value, hint, delta, up, accent, glow, icon, delay }: StatCardProps) {
  const numeric = typeof value === "number";
  return (
    <div className="reveal group relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        animationDelay: `${delay}s`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.065)";
        (e.currentTarget as HTMLElement).style.border = `1px solid ${accent}30`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${glow}18`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}>
      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${glow}25, transparent)`, filter: "blur(16px)" }} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.7)" }}>{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-white truncate">
            {numeric ? <Counter target={value as number} /> : value}
          </p>
          <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}>
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {delta}
            <span style={{ color: "rgba(100,116,139,0.7)" }} className="font-normal">{hint}</span>
          </div>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${accent}18`, border: `1px solid ${accent}28` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ──────────────────────────────── */
export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [updated, setUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setUpdated(new Date().toLocaleTimeString("vi-VN"));
    Promise.all([api.get("/api/admin/dashboard"), api.get("/api/cars")])
      .then(([dash, carRes]) => { setData(dash.data); setCars(carRes.data); })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const fleet = useMemo(() => {
    const total = cars.length || 1;
    const available    = cars.filter((c) => c.status === "AVAILABLE").length;
    const rented       = cars.filter((c) => c.status === "UNAVAILABLE").length;
    const maintenance  = cars.filter((c) => c.status === "MAINTENANCE").length;
    return {
      available, rented, maintenance,
      availablePct:   (available / total) * 100,
      rentedPct:      (rented / total) * 100,
      maintenancePct: (maintenance / total) * 100,
    };
  }, [cars]);

  const cancelRate = data && data.totalBookings
    ? ((data.cancelledBookings / data.totalBookings) * 100).toFixed(1) : "0.0";

  const STATS: StatCardProps[] = data ? [
    { title: "Tổng số xe",         value: data.totalCars,       hint: "so với tháng trước", delta: "+8.2%",  up: true,  accent: "#00ffc8", glow: "#00ffc8", delay: 0,    icon: <CarFront   className="h-5 w-5" style={{ color: "#00ffc8" }} /> },
    { title: "Đơn đặt trong tháng",value: data.totalBookings,   hint: "so với tháng trước", delta: "+12.5%", up: true,  accent: "#818cf8", glow: "#818cf8", delay: 0.08, icon: <BarChart3  className="h-5 w-5" style={{ color: "#818cf8" }} /> },
    { title: "Doanh thu tháng này", value: money(data.totalRevenue), hint: "so với tháng trước", delta: "+15.3%", up: true, accent: "#f59e0b", glow: "#f59e0b", delay: 0.16, icon: <FileBarChart className="h-5 w-5" style={{ color: "#f59e0b" }} /> },
    { title: "Khách hàng mới",      value: data.totalCustomers,  hint: "so với tháng trước", delta: "+5.7%",  up: true,  accent: "#34d399", glow: "#34d399", delay: 0.24, icon: <UserPlus   className="h-5 w-5" style={{ color: "#34d399" }} /> },
    { title: "Đơn chờ duyệt",       value: data.pendingBookings, hint: "so với tháng trước", delta: "-2.1%",  up: false, accent: "#fb923c", glow: "#fb923c", delay: 0.32, icon: <CalendarPlus className="h-5 w-5" style={{ color: "#fb923c" }} /> },
    { title: "Tỷ lệ hủy đơn",       value: `${cancelRate}%`,    hint: "so với tháng trước", delta: "-1.2%",  up: true,  accent: "#f87171", glow: "#f87171", delay: 0.4,  icon: <TrendingDown className="h-5 w-5" style={{ color: "#f87171" }} /> },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Tổng quan</h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(100,116,139,0.8)" }}>
            Chào mừng trở lại! Tình hình hoạt động thuê xe hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "rgba(100,116,139,0.6)" }}>Cập nhật lúc {updated}</span>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
            style={{ background: "rgba(0,255,200,0.08)", border: "1px solid rgba(0,255,200,0.2)", color: "#00ffc8" }}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl p-5 h-28"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {STATS.map((s) => <StatCard key={s.title} {...s} />)}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Fleet donut */}
        <section className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(0,255,200,0.12)" }}>
                <CarFront className="h-4 w-4" style={{ color: "#00ffc8" }} />
              </span>
              Tình trạng đội xe
            </h2>
            <Link href="/admin/fleet"
              className="flex items-center gap-1 text-xs font-semibold transition hover:opacity-75"
              style={{ color: "#00ffc8" }}>
              Chi tiết <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Donut percent={fleet.availablePct} label="Sẵn sàng" count={fleet.available} color="#00ffc8" glow="#00ffc8" />
            <Donut percent={fleet.rentedPct}    label="Đang thuê" count={fleet.rented}    color="#818cf8" glow="#818cf8" />
            <Donut percent={fleet.maintenancePct} label="Bảo trì" count={fleet.maintenance} color="#f59e0b" glow="#f59e0b" />
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="flex items-center gap-2 text-base font-bold text-white mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "rgba(245,158,11,0.12)" }}>
              <FileBarChart className="h-4 w-4" style={{ color: "#f59e0b" }} />
            </span>
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/cars",      icon: CarFront,     color: "#00ffc8", bg: "rgba(0,255,200,0.1)",    title: "Thêm xe mới",    desc: "Đăng ký xe vào hệ thống" },
              { href: "/admin/bookings",  icon: CalendarPlus, color: "#34d399", bg: "rgba(52,211,153,0.1)",   title: "Đơn đặt xe",     desc: "Xem và duyệt đơn đặt"   },
              { href: "/admin/customers", icon: UserPlus,     color: "#818cf8", bg: "rgba(129,140,248,0.1)",  title: "Khách hàng",     desc: "Quản lý hồ sơ khách"    },
              { href: "/admin/reports",   icon: FileBarChart, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   title: "Báo cáo",        desc: "Xem số liệu kinh doanh" },
            ].map((item) => (
              <Link key={item.title} href={item.href}
                className="group rounded-2xl p-4 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = item.bg;
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${item.color}30`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: item.bg, border: `1px solid ${item.color}25` }}>
                  <item.icon className="h-5 w-5" style={{ color: item.color }} />
                </span>
                <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                <p className="mt-0.5 text-xs" style={{ color: "rgba(100,116,139,0.7)" }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
