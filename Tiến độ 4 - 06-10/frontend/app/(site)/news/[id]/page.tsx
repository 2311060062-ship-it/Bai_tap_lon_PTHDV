"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { News } from "@/lib/types";

type Comment = { commentId: number; content: string; authorName?: string; createdAt?: string };

export default function NewsDetailPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<News | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const load = () => {
    api.get(`/api/news/${params.id}`).then((res) => setItem(res.data)).catch(() => setItem(null));
    api.get(`/api/news/${params.id}/comments`).then((res) => setComments(res.data)).catch(() => setComments([]));
  };

  useEffect(() => {
    setLoggedIn(!!getCurrentUser());
    load();
  }, [params.id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!getCurrentUser()) {
      window.location.href = `/login?next=/news/${params.id}`;
      return;
    }
    try {
      await api.post(`/api/news/${params.id}/comments`, { content });
      setContent("");
      setMessage("");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không gửi được bình luận");
    }
  };

  if (!item) return <p className="p-10">Đang tải...</p>;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-brand-900">{item.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{item.authorName} · {item.createdAt?.slice(0, 10)}</p>
      <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-700">{item.content}</p>

      <section className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold">Bình luận</h2>
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <div key={comment.commentId} className="rounded-xl border bg-white p-4">
              <p className="text-sm font-medium">{comment.authorName}</p>
              <p className="mt-1 text-sm text-slate-600">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-slate-500">Chưa có bình luận.</p>}
        </div>
        <form onSubmit={submit} className="mt-4 space-y-2">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={loggedIn ? "Viết bình luận..." : "Đăng nhập để bình luận"} className="w-full rounded-xl border px-3 py-2" required />
          {message && <p className="text-sm text-accent-600">{message}</p>}
          <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">{loggedIn ? "Gửi bình luận" : "Đăng nhập để bình luận"}</button>
        </form>
        {!loggedIn && <Link href={`/login?next=/news/${params.id}`} className="mt-2 inline-block text-sm text-brand-700">Đăng nhập</Link>}
      </section>
    </article>
  );
}
