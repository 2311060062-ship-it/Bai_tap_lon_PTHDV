"use client";

import { Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { COMPANY_HOTLINE_LABEL, companyZaloUrl, formatPhoneLabel } from "@/lib/support";
import { useShopZalo } from "@/lib/useShopZalo";
import { LogoCombination } from "@/components/Logo";

export function Footer() {
  const shopZalo = useShopZalo();

  return (
    <footer className="relative overflow-hidden bg-navy-900 text-slate-300">
      {/* Background Decorative Ambient Circles */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl animate-ambient-glow" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl animate-ambient-glow" />

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block transition duration-200 hover:opacity-90">
              <LogoCombination iconSize={36} showTagline={true} />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Hệ thống dịch vụ cho thuê xe ô tô tự lái hàng đầu Việt Nam. Cam kết chất lượng xe đời mới, giao xe tận nơi, đặt cọc 30% tiện lợi và hợp đồng điện tử minh bạch.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-400">
              <ShieldCheck className="h-4 w-4 text-gold-400" />
              <span>Đảm bảo 100% bảo hiểm & hỗ trợ kỹ thuật 24/7</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="text-sm space-y-3">
            <p className="font-bold text-white tracking-wide uppercase text-xs">Khám phá</p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/cars" className="transition duration-200 hover:text-gold-400 hover:translate-x-1 inline-block">
                  Xe cho thuê
                </Link>
              </li>
              <li>
                <Link href="/news" className="transition duration-200 hover:text-gold-400 hover:translate-x-1 inline-block">
                  Tin tức & Cẩm nang
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition duration-200 hover:text-gold-400 hover:translate-x-1 inline-block">
                  Liên hệ hỗ trợ
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                  <Sparkles className="h-3 w-3" /> Đặt cọc linh hoạt 30%
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="text-sm space-y-3">
            <p className="font-bold text-white tracking-wide uppercase text-xs">Liên hệ & Địa chỉ</p>
            <div className="space-y-2.5 text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Hotline: <strong className="text-white">{COMPANY_HOTLINE_LABEL}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-brand-500 shrink-0" />
                <a
                  href={companyZaloUrl("Xin chào, tôi cần hỗ trợ thuê xe CarRental.", shopZalo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-gold-400"
                >
                  Zalo: <strong className="text-white">{formatPhoneLabel(shopZalo)}</strong>
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-500 shrink-0" />
                <span>support@carrental.vn</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} CarRental Vietnam. All rights reserved.</p>
          <p className="text-slate-400">
            Đồ án PTPMHDV ·{" "}
            <Link href="/admin/login" className="text-slate-500 hover:text-gold-400">
              Cổng quản trị
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
