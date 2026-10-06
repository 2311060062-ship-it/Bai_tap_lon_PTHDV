"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, Bell, BookOpen, CalendarDays, CarFront,
  ChevronDown, ChevronRight, LayoutDashboard, LogOut,
  MessageSquare, Search, Settings, Sparkles, Users,
  Wallet, Warehouse, X, Menu,
} from "lucide-react";
import { clearAuth, getCurrentUser, isAdminSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { AdminLogoCombination } from "@/components/Logo";

type NavLinkItem =
  | { href: string; label: string; icon: React.ComponentType<{ className?: string }> }
  | { label: string; icon: React.ComponentType<{ className?: string }>; children: { href: string; label: string }[] };

const links: NavLinkItem[] = [
  { href: "/admin",            label: "Tổng quan",         icon: LayoutDashboard },
  { label: "Quản lý xe", icon: CarFront, children: [
      { href: "/admin/cars",         label: "Danh sách xe" },
      { href: "/admin/cars/brands",  label: "Hãng xe" },
      { href: "/admin/cars/types",   label: "Loại xe" },
      { href: "/admin/cars/details", label: "Chi tiết xe" },
  ]},
  { href: "/admin/fleet",      label: "Đội xe",            icon: Warehouse },
  { href: "/admin/customers",  label: "Khách hàng",        icon: Users },
  { href: "/admin/bookings",   label: "Đơn đặt xe",        icon: CalendarDays },
  { href: "/admin/payments",   label: "Thanh toán",        icon: Wallet },
  { href: "/admin/reports",    label: "Báo cáo doanh thu", icon: BarChart3 },
  { href: "/admin/news",       label: "Tin tức & Bài viết",icon: BookOpen },
  { href: "/admin/contacts",   label: "Liên hệ khách",     icon: MessageSquare },
  { href: "/admin/settings",   label: "Cài đặt hệ thống",  icon: Settings },
];

/* ─── Sidebar content (shared between desktop + mobile) ─── */
function SidebarContent({
  pathname, name, initials, carsOpen, onToggleCars, onLogout, isActive,
}: {
  pathname: string; name: string; initials: string;
  carsOpen: boolean; onToggleCars: () => void; onLogout: () => void;
  isActive: (href: string) => boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link href="/admin" className="block px-5 py-5 transition-opacity hover:opacity-90"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <AdminLogoCombination iconSize={36} />
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {links.map((item) => {
          if ("children" in item) {
            const groupActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button type="button" onClick={onToggleCars}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200"
                  style={{
                    color: groupActive ? "#00ffc8" : "rgba(148,163,184,0.9)",
                    background: groupActive ? "rgba(0,255,200,0.08)" : "transparent",
                    borderLeft: groupActive ? "2px solid #00ffc8" : "2px solid transparent",
                  }}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {carsOpen
                    ? <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                    : <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />}
                </button>
                {carsOpen && (
                  <div className="animate-slide-down ml-4 mt-0.5 space-y-0.5 pl-3"
                    style={{ borderLeft: "1px solid rgba(0,255,200,0.15)" }}>
                    {item.children.map((child) => {
                      const active = isActive(child.href);
                      return (
                        <Link key={child.href} href={child.href}
                          className="block rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
                          style={{
                            color: active ? "#00ffc8" : "rgba(100,116,139,0.9)",
                            background: active ? "rgba(0,255,200,0.08)" : "transparent",
                          }}>
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 group"
              style={{
                color: active ? "#00ffc8" : "rgba(148,163,184,0.85)",
                background: active ? "rgba(0,255,200,0.08)" : "transparent",
                borderLeft: active ? "2px solid #00ffc8" : "2px solid transparent",
              }}>
              <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "#00ffc8" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom – user + logout */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* User card */}
        <div className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#00ffc8,#00b4d8)", color: "#020c18" }}>
            {initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-bold text-white leading-tight">{name}</p>
            <p className="text-[10px]" style={{ color: "rgba(0,255,200,0.6)" }}>Quản trị viên</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200"
          style={{ color: "rgba(148,163,184,0.7)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.1)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(148,163,184,0.7)"; }}>
          <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

/* ─── Main Layout ─── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [query, setQuery] = useState("");
  const [name, setName] = useState("Admin");
  const [carsOpen, setCarsOpen] = useState(pathname.startsWith("/admin/cars"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [ready, setReady] = useState(isLogin);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!isAdminSession()) {
      router.replace("/admin/login");
      return;
    }
    setName(getCurrentUser("admin")?.fullName || "Admin");
    api.get("/api/auth/me")
      .then((res) => {
        if (res.data?.fullName) setName(res.data.fullName);
        setReady(true);
      })
      .catch(() => {
        if (!isAdminSession()) {
          router.replace("/admin/login");
          return;
        }
        setReady(true);
      });
  }, [router, isLogin]);

  useEffect(() => {
    if (pathname.startsWith("/admin/cars")) setCarsOpen(true);
    setMobileOpen(false);
  }, [pathname]);

  const logout = () => { clearAuth("admin"); window.location.href = "/admin/login"; };

  if (isLogin) return <>{children}</>;
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400" style={{ background: "#0d1f35" }}>
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  const initials = name.split(" ").slice(-2).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  const sidebarProps = { pathname, name, initials, carsOpen, onToggleCars: () => setCarsOpen(v => !v), onLogout: logout, isActive };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d1f35" }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="relative hidden h-screen w-64 shrink-0 md:flex md:flex-col"
        style={{ background: "#0a1628", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Subtle orb decoration */}
        <div className="pointer-events-none absolute left-0 top-24 h-48 w-48 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #00ffc8, transparent)", filter: "blur(40px)" }} />
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile Sidebar overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-64 shadow-2xl"
            style={{ background: "#0a1628", borderRight: "1px solid rgba(255,255,255,0.08)", animation: "slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
            <button onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <X className="h-4 w-4" />
            </button>
            <SidebarContent {...sidebarProps} />
          </div>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">

        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center gap-4 px-5 py-3.5"
          style={{
            background: "rgba(13,31,53,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          }}>

          {/* Mobile menu btn */}
          <button onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:text-white md:hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <Menu className="h-4 w-4" />
          </button>

          {/* Search */}
          <form className="relative flex-1 max-w-md" onSubmit={(e) => { e.preventDefault(); router.push("/admin/cars"); }}>
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm xe, khách hàng, đơn đặt..."
              className="w-full rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-300 outline-none transition-all placeholder:text-slate-600"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(0,255,200,0.35)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,255,200,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }} />
          </form>

          <div className="flex items-center gap-2.5 ml-auto">
            {/* View website */}
            <Link href="/" target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
              <Sparkles className="h-3.5 w-3.5" /> Xem Website
            </Link>

            {/* Notification bell */}
            <button type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Bell className="h-4 w-4 text-slate-400" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white"
                style={{ boxShadow: "0 0 8px rgba(244,63,94,0.5)" }}>
                3
              </span>
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-2.5"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#00ffc8,#00b4d8)", color: "#020c18" }}>
                {initials}
              </span>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{name}</p>
                <p className="text-[10px]" style={{ color: "rgba(0,255,200,0.6)" }}>Quản trị viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-6">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
