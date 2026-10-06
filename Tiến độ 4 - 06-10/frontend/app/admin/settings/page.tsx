"use client";

import { useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { cacheShopZaloPhone, companyZaloUrl, formatPhoneLabel, normalizeVnMobile } from "@/lib/support";
import { useShopZalo } from "@/lib/useShopZalo";

export default function AdminSettingsPage() {
  const shopZalo = useShopZalo();
  const [zaloDraft, setZaloDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setZaloDraft(shopZalo);
  }, [shopZalo]);

  const save = async () => {
    const normalized = normalizeVnMobile(zaloDraft);
    if (!normalized) {
      setMessage("Nhập số di động 10 số gắn Zalo. Không dùng hotline 1900.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await api.put<{ zaloPhone: string }>("/api/admin/settings", { zaloPhone: normalized });
      cacheShopZaloPhone(res.data.zaloPhone || normalized);
      setMessage("Đã lưu số Zalo hỗ trợ.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Cài đặt</h1>
      <div className="mt-6 space-y-3 rounded-2xl border bg-white p-6 text-sm">
        <p><b>Hệ thống:</b> Spring Boot 4.1.0 + Next.js 14</p>
        <p><b>Database:</b> MySQL `car_rental` (XAMPP)</p>
        <p><b>Cọc mặc định:</b> 30% tổng tiền thuê</p>
        <p><b>Admin:</b> admin / Admin@123</p>
        <p className="text-slate-500">Thanh toán MoMo/VNPay là giả lập theo phạm vi báo cáo.</p>
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-6">
        <p className="text-sm font-bold text-slate-900">Số Zalo hỗ trợ</p>
        <p className="mt-1 text-xs text-slate-500">
          Số này hiện trên website khách và nút Chat Zalo ở tin nhắn hỗ trợ.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={zaloDraft}
            onChange={(e) => {
              setZaloDraft(e.target.value);
              setMessage("");
            }}
            placeholder="0912 345 678"
            className="min-w-[220px] flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu số Zalo"}
          </button>
          <a
            href={companyZaloUrl("Xin chào CarRental", shopZalo)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#0068FF] px-4 py-2.5 text-xs font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Thử mở {formatPhoneLabel(shopZalo)}
          </a>
        </div>
        {message && (
          <p className={`mt-2 text-xs ${message.startsWith("Đã lưu") ? "text-emerald-600" : "text-rose-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
