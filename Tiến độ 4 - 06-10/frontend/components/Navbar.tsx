"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import { clearAuth, getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/types";
import { LogoCombination } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/", label: "Trang Chủ" },
  { href: "/cars", label: "Xe Cho Thuê" },
  { href: "/news", label: "Tin Tức" },
  { href: "/contact", label: "Liên Hệ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const logout = () => {
    clearAuth("customer");
    setUser(null);
    window.location.href = "/";
  };

  const initials = (user?.fullName || "U")
    .split(" ")
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-900/90 shadow-lift backdrop-blur-xl border-b border-white/10"
          : "bg-navy-800 border-b border-brand-500/40"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group transition-all duration-300 hover:opacity-90"
          style={{ transform: "translateY(0)", transition: "transform 0.25s ease, opacity 0.25s ease" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
        >
          <LogoCombination iconSize={34} showTagline={false} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-[15px] font-semibold transition-all duration-200 ${
                  active
                    ? "text-gold-400"
                    : "text-slate-200 hover:text-white hover:-translate-y-0.5"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-gold-400 to-amber-300 animate-fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Auth & User Actions */}
        <div className="hidden items-center gap-3 text-sm md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-brand-500/40 bg-brand-900/40 py-1.5 pl-1.5 pr-3.5 text-white transition duration-200 hover:border-brand-500 hover:bg-brand-900/70"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-xs font-bold text-white shadow-sm">
                  {initials}
                </span>
                <span className="max-w-[140px] truncate font-semibold text-slate-100">
                  {user.fullName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-300 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open && (
                <div className="animate-scale-in absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-1.5 text-slate-800 shadow-lift backdrop-blur-xl">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs text-slate-400">Đăng nhập với tư cách</p>
                    <p className="truncate text-sm font-bold text-navy-900">
                      {user.fullName}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition duration-150 hover:bg-brand-50 hover:text-brand-600"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" /> Tài khoản của tôi
                  </Link>
                  <Link
                    href="/bookings"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition duration-150 hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Sparkles className="h-4 w-4 text-slate-400" /> Đơn đặt xe
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition duration-150 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 font-semibold text-slate-200 transition-colors duration-200 hover:text-gold-400"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="btn-shine rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 font-semibold text-white shadow-glow transition-all duration-300 hover:scale-105"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="animate-slide-down border-t border-white/10 bg-navy-900/95 px-4 py-6 shadow-2xl backdrop-blur-xl md:hidden">
          <nav className="flex flex-col space-y-3">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2.5 text-base font-semibold transition ${
                    active
                      ? "bg-brand-500/20 text-gold-400"
                      : "text-slate-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                    {initials}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{user.fullName}</p>
                    <p className="text-xs text-slate-400">{user.username}</p>
                  </div>
                </div>
                <Link
                  href="/account"
                  className="block rounded-xl px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Tài khoản của tôi
                </Link>
                <Link
                  href="/bookings"
                  className="block rounded-xl px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Đơn đặt xe
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="rounded-xl border border-white/20 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/10"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="btn-shine rounded-xl bg-brand-500 py-2.5 text-center text-sm font-semibold text-white shadow-glow"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
