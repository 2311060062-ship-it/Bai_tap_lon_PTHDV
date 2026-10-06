"use client";

import { FormEvent, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { COMPANY_HOTLINE_LABEL, companyZaloUrl, formatPhoneLabel } from "@/lib/support";
import { useShopZalo } from "@/lib/useShopZalo";

export default function ContactPage() {
  const shopZalo = useShopZalo();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", messageContent: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/contact-messages", form);
      setSuccess(true);
      setMessage("Cảm ơn bạn! Chúng tôi sẽ phản hồi trong vòng 1 giờ.");
      setForm({ fullName: "", email: "", phone: "", messageContent: "" });
    } catch (err) {
      setSuccess(false);
      setMessage(err instanceof Error ? err.message : "Gửi thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Header */}
      <div className="animate-fade-up text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600 mb-3">
          <MessageSquare className="h-4 w-4" />
          Hỗ trợ trực tuyến 24/7
        </div>
        <h1 className="text-4xl font-extrabold text-navy-900">Liên Hệ & Hỗ Trợ</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 để có chuyến đi hoàn hảo nhất.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left – Contact Info */}
        <div className="space-y-6">
          <div className="reveal rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card space-y-6">
            <h2 className="text-xl font-extrabold text-navy-900">Thông tin liên hệ</h2>
            {[
              {
                icon: Phone,
                color: "bg-brand-50 text-brand-500",
                title: "Hotline 24/7",
                value: COMPANY_HOTLINE_LABEL,
                sub: "Gọi miễn phí mọi lúc",
              },
              {
                icon: MessageSquare,
                color: "bg-blue-50 text-blue-600",
                title: "Zalo hỗ trợ",
                value: formatPhoneLabel(shopZalo),
                sub: "Chat trực tiếp với tư vấn viên",
                href: companyZaloUrl("Xin chào, tôi cần hỗ trợ thuê xe CarRental.", shopZalo),
              },
              {
                icon: Mail,
                color: "bg-emerald-50 text-emerald-600",
                title: "Email hỗ trợ",
                value: "support@carrental.vn",
                sub: "Phản hồi trong 30 phút",
              },
              {
                icon: MapPin,
                color: "bg-amber-50 text-amber-600",
                title: "Văn phòng",
                value: "Hà Nội & TP. Hồ Chí Minh",
                sub: "Giao xe tận nơi toàn quốc",
              },
              {
                icon: Clock,
                color: "bg-violet-50 text-violet-600",
                title: "Giờ làm việc",
                value: "07:00 – 22:00 hàng ngày",
                sub: "Kể cả lễ, tết",
              },
            ].map((info, i) => {
              const body = (
                <>
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${info.color} transition-transform duration-300 hover:scale-110`}
                  >
                    <info.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">{info.title}</p>
                    <p className="text-sm font-bold text-navy-900">{info.value}</p>
                    <p className="text-xs text-slate-500">{info.sub}</p>
                  </div>
                </>
              );
              return "href" in info && info.href ? (
                <a
                  key={info.title}
                  href={info.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reveal flex items-center gap-4 rounded-2xl transition hover:bg-slate-50"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {body}
                </a>
              ) : (
                <div
                  key={info.title}
                  className="reveal flex items-center gap-4"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {body}
                </div>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="reveal grid grid-cols-3 gap-3" style={{ animationDelay: "0.3s" }}>
            {[
              { val: "500+", label: "Khách hàng / tháng" },
              { val: "4.9★", label: "Đánh giá trung bình" },
              { val: "<1h", label: "Thời gian phản hồi" },
            ].map((s) => (
              <div key={s.val} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-card">
                <p className="text-xl font-extrabold text-brand-600">{s.val}</p>
                <p className="mt-1 text-[11px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Form */}
        <div className="reveal-right">
          <form
            onSubmit={submit}
            className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lift space-y-5"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-navy-900">Gửi tin nhắn</h2>
                <p className="text-xs text-slate-400">Chúng tôi phản hồi trong &lt; 1 giờ</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Họ và tên *</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Số Zalo / điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0912 345 678"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Để shop nhắn lại qua Zalo. Không dùng hotline 1900.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Nội dung *</label>
              <textarea
                value={form.messageContent}
                onChange={(e) => setForm({ ...form, messageContent: e.target.value })}
                placeholder="Tôi muốn hỏi về việc thuê xe vào dịp lễ, có xe nào phù hợp không?..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 resize-none"
                required
              />
            </div>

            {message && (
              <div
                className={`animate-scale-spring flex items-center gap-2 rounded-2xl p-3 text-xs font-medium ${
                  success
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {success && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-sm font-bold text-white shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              {loading ? "Đang gửi..." : "Gửi tin nhắn"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
