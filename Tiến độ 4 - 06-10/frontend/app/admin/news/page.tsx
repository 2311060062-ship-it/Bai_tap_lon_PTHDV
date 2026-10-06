"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { News } from "@/lib/types";

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const load = () => api.get("/api/news").then((res) => setItems(res.data)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/api/news", { title, content });
    setTitle("");
    setContent("");
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Quản lý tin tức</h1>
      <form onSubmit={create} className="mt-4 space-y-3 rounded-2xl border bg-white p-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" className="w-full rounded-xl border px-3 py-2" required />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nội dung" className="w-full rounded-xl border px-3 py-2" required />
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Đăng bài</button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.newsId} className="rounded-xl border bg-white p-4">
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-slate-600">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
