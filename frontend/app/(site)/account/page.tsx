"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getCurrentUser, saveAuth, getToken } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", username: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login?next=/account");
      return;
    }
    api.get("/api/auth/me")
      .then((res) => {
        setForm({
          fullName: res.data.fullName || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          username: res.data.username || "",
        });
      })
      .catch(() => setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        username: user.username,
      }));
  }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const user = getCurrentUser();
    const token = getToken();
    if (!user || !token) return;
    try {
      const res = await api.put(`/api/users/${user.userId}`, {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
      });
      saveAuth(token, {
        ...user,
        fullName: res.data.fullName,
        phone: res.data.phone,
        email: res.data.email,
      });
      setMessage("Đã cập nhật hồ sơ.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Cập nhật thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-semibold text-brand-900">Tài khoản của tôi</h1>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border bg-white p-6">
        <input value={form.username} disabled className="w-full rounded-xl border bg-slate-50 px-3 py-2" />
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Họ và tên" className="w-full rounded-xl border px-3 py-2" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-xl border px-3 py-2" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Số điện thoại" className="w-full rounded-xl border px-3 py-2" />
        {message && <p className="text-sm text-brand-700">{message}</p>}
        <button className="w-full rounded-xl bg-brand-700 py-2.5 text-white">Lưu thay đổi</button>
      </form>
    </div>
  );
}
