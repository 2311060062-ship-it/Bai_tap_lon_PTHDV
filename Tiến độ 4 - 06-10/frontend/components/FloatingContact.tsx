"use client";

import { useState } from "react";
import { MessageCircle, Phone, Sparkles, X } from "lucide-react";
import { COMPANY_HOTLINE, COMPANY_HOTLINE_LABEL, companyZaloUrl } from "@/lib/support";
import { useShopZalo } from "@/lib/useShopZalo";

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const shopZalo = useShopZalo();

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Popover Card */}
      {open && (
        <div className="animate-scale-in mb-4 w-72 rounded-2xl border border-white/50 bg-white/95 p-4 shadow-lift backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Sparkles className="h-4 w-4" />
              </span>
              <p className="text-sm font-bold text-navy-900">Hỗ trợ trực tuyến 24/7</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Chúng tôi luôn sẵn sàng hỗ trợ tư vấn chọn xe và đặt lịch thuê nhanh nhất!
          </p>

          <div className="mt-3 space-y-2">
            <a
              href={`tel:${COMPANY_HOTLINE}`}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition duration-200 hover:border-brand-500 hover:bg-brand-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white transition duration-200 group-hover:scale-105">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-slate-400">Hotline tư vấn</p>
                <p className="text-sm font-bold text-brand-600">{COMPANY_HOTLINE_LABEL}</p>
              </div>
            </a>

            <a
              href={companyZaloUrl("Xin chào, tôi cần hỗ trợ thuê xe CarRental.", shopZalo)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition duration-200 hover:border-blue-500 hover:bg-blue-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white transition duration-200 group-hover:scale-105">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-slate-400">Nhắn tin qua Zalo</p>
                <p className="text-sm font-bold text-blue-600">Chat Zalo ngay</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button with Glowing Wave Effect */}
      <div className="relative">
        <span className="absolute -inset-1 animate-ping rounded-full bg-brand-500/30 duration-1000" />
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Hỗ trợ trực tuyến"
          className="relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-r from-brand-600 to-brand-500 p-3.5 text-white shadow-lift transition-all duration-300 hover:scale-110 hover:shadow-glow"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6 animate-pulse" />}
        </button>
      </div>
    </div>
  );
}
