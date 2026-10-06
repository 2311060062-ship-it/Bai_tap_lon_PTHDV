"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, ChevronRight, Newspaper } from "lucide-react";
import { api } from "@/lib/api";
import type { News } from "@/lib/types";

export default function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/news")
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="animate-fade-up border-b border-slate-200 pb-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-600 mb-3">
          <Newspaper className="h-3.5 w-3.5" />
          Cẩm nang & Tin tức xe
        </div>
        <h1 className="text-4xl font-extrabold text-navy-900">Tin Tức & Cẩm Nang</h1>
        <p className="mt-2 text-sm text-slate-500">
          Cập nhật thông tin xe mới nhất, kinh nghiệm thuê xe và các ưu đãi đặc biệt.
        </p>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="mt-8 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-white p-6 shadow-card">
              <div className="h-5 w-1/3 rounded-lg bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded-lg bg-slate-200" />
              <div className="mt-2 h-4 w-2/3 rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-5 stagger-children">
          {items.map((item, i) => (
            <Link
              key={item.newsId}
              href={`/news/${item.newsId}`}
              className="reveal group flex gap-5 rounded-3xl border border-slate-100/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/50 hover:shadow-lift"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Newspaper className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-navy-900 group-hover:text-brand-600 transition-colors duration-200 line-clamp-1">
                  {item.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 leading-relaxed">
                  {item.content}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                      : "Mới đăng"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Đọc tiếp <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="animate-scale-spring rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-slate-500">Chưa có bài viết nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
