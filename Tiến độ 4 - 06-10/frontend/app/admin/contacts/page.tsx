"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Send,
} from "lucide-react";
import { api } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";
import {
  COMPANY_EMAIL,
  COMPANY_HOTLINE,
  COMPANY_HOTLINE_LABEL,
  cacheShopZaloPhone,
  canOpenZalo,
  companyZaloUrl,
  formatPhoneLabel,
  normalizeVnMobile,
  zaloChatUrl,
} from "@/lib/support";
import { useShopZalo } from "@/lib/useShopZalo";

function formatWhen(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminContactsPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const shopZalo = useShopZalo();
  const [zaloDraft, setZaloDraft] = useState("");
  const [zaloSaving, setZaloSaving] = useState(false);
  const [zaloMessage, setZaloMessage] = useState("");

  useEffect(() => {
    setZaloDraft(shopZalo);
  }, [shopZalo]);

  const load = () =>
    api
      .get<ContactMessage[]>("/api/contact-messages")
      .then((res) => {
        setItems(res.data);
        setSelectedId((prev) => prev ?? res.data[0]?.messageId ?? null);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.fullName, item.email, item.phone, item.messageContent]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, query]);

  const selected = items.find((item) => item.messageId === selectedId) || null;
  const unread = items.filter((item) => item.status === "NEW").length;

  const markRead = async (id: number) => {
    try {
      const res = await api.put<ContactMessage>(`/api/contact-messages/${id}/read`);
      setItems((prev) => prev.map((item) => (item.messageId === id ? res.data : item)));
    } catch {
      /* giữ nguyên nếu API chưa restart */
    }
  };

  const openThread = (item: ContactMessage) => {
    setSelectedId(item.messageId);
    setReply("");
    if (item.status === "NEW") void markRead(item.messageId);
  };

  const saveShopZalo = async () => {
    const normalized = normalizeVnMobile(zaloDraft);
    if (!normalized) {
      setZaloMessage("Nhập số di động 10 số gắn Zalo (ví dụ 0912 345 678). Không dùng 1900.");
      return;
    }
    setZaloSaving(true);
    setZaloMessage("");
    try {
      const res = await api.put<{ zaloPhone: string }>("/api/admin/settings", { zaloPhone: normalized });
      cacheShopZaloPhone(res.data.zaloPhone || normalized);
      setZaloDraft(res.data.zaloPhone || normalized);
      setZaloMessage("Đã lưu số Zalo. Khách bấm Chat Zalo sẽ mở đúng số này.");
    } catch (err) {
      setZaloMessage(err instanceof Error ? err.message : "Lưu thất bại. Hãy chạy lại Spring Boot.");
    } finally {
      setZaloSaving(false);
    }
  };

  const zaloHref = selected
    ? zaloChatUrl(
        selected.phone,
        reply.trim() ||
          `Xin chào ${selected.fullName}, CarRental đã nhận tin nhắn của bạn.`
      )
    : companyZaloUrl(undefined, shopZalo);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Tin nhắn hỗ trợ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hộp thư từ form Liên hệ. Chat tiếp với khách trên Zalo bằng số điện thoại họ gửi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unread > 0 && (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
              {unread} tin mới
            </span>
          )}
          <a
            href={companyZaloUrl("Xin chào, tôi cần hỗ trợ thuê xe CarRental.", shopZalo)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0068FF] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" />
            Mở Zalo của tôi · {formatPhoneLabel(shopZalo)}
          </a>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-navy-900">Số Zalo của bạn</p>
        <p className="mt-1 text-xs text-slate-500">
          Điền số điện thoại đã đăng ký Zalo. Nút hỗ trợ trên website khách sẽ chuyển tới số này.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={zaloDraft}
            onChange={(e) => {
              setZaloDraft(e.target.value);
              setZaloMessage("");
            }}
            placeholder="0912 345 678"
            className="min-w-[220px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => void saveShopZalo()}
            disabled={zaloSaving}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {zaloSaving ? "Đang lưu..." : "Lưu số Zalo"}
          </button>
        </div>
        {zaloMessage && (
          <p className={`mt-2 text-xs ${zaloMessage.startsWith("Đã lưu") ? "text-emerald-600" : "text-rose-600"}`}>
            {zaloMessage}
          </p>
        )}
      </div>

      <div className="mt-6 grid min-h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col border-b border-slate-100 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tên, SĐT, nội dung..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <p className="px-4 py-6 text-sm text-slate-400">Đang tải...</p>}
            {!loading &&
              filtered.map((item) => {
                const active = item.messageId === selectedId;
                const isNew = item.status === "NEW";
                return (
                  <button
                    key={item.messageId}
                    type="button"
                    onClick={() => openThread(item)}
                    className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition ${
                      active ? "bg-brand-50/80" : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${
                        active ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {initials(item.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-navy-900">{item.fullName}</span>
                        {isNew && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                        {item.phone || item.email}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-600">{item.messageContent}</span>
                    </span>
                  </button>
                );
              })}
            {!loading && filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Chưa có tin nhắn.</p>
            )}
          </div>
        </aside>

        <section className="flex min-h-[360px] flex-col bg-[#F7F9FC]">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
              <MessageCircle className="h-10 w-10 opacity-40" />
              <p>Chọn một tin nhắn để xem và chuyển sang Zalo.</p>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
                <div>
                  <p className="text-base font-bold text-navy-900">{selected.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {formatPhoneLabel(selected.phone)} · {selected.email}
                    {selected.createdAt ? ` · ${formatWhen(selected.createdAt)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={zaloHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0068FF] px-3 py-2 text-xs font-bold text-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Chat Zalo
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <Phone className="h-3.5 w-3.5" /> Gọi
                    </a>
                  )}
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <p className="whitespace-pre-wrap">{selected.messageContent}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{formatWhen(selected.createdAt) || "Vừa gửi"}</p>
                </div>
                {!canOpenZalo(selected.phone) && (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    Khách chưa gửi số Zalo hợp lệ. Nút Chat Zalo sẽ mở số hỗ trợ công ty{" "}
                    <b>{formatPhoneLabel(shopZalo)}</b>.
                  </p>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <p className="mb-2 text-[11px] text-slate-400">
                  Soạn nội dung rồi bấm Chat Zalo — tin sẽ mở sẵn trên Zalo của khách.
                </p>
                <div className="flex gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder="Ví dụ: Xe vẫn còn, anh/chị inbox Zalo để shop gửi hợp đồng..."
                    className="min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white"
                  />
                  <a
                    href={zaloHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-1.5 self-end rounded-2xl bg-[#0068FF] px-4 text-xs font-bold text-white"
                  >
                    <Send className="h-4 w-4" /> Zalo
                  </a>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Hotline {COMPANY_HOTLINE_LABEL} ({COMPANY_HOTLINE}) · Email {COMPANY_EMAIL} · Zalo shop không dùng đầu số 1900.
      </p>
    </div>
  );
}
