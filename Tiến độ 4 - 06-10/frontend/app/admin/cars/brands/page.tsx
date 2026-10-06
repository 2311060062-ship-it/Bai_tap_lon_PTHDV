"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Brand } from "@/lib/types";

export default function AdminBrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    api.get<Brand[]>("/api/brands").then((res) => setItems(res.data)).catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setBrandName("");
    setDescription("");
    setError("");
  };

  const startEdit = (item: Brand) => {
    setEditingId(item.brandId);
    setBrandName(item.brandName);
    setDescription(item.description || "");
    setError("");
    setMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!brandName.trim()) {
      setError("Nhập tên hãng xe");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const body = { brandName: brandName.trim(), description: description.trim() };
    try {
      if (editingId) {
        await api.put(`/api/brands/${editingId}`, body);
        setMessage("Đã cập nhật hãng xe");
      } else {
        await api.post("/api/brands", body);
        setMessage("Đã thêm hãng xe");
      }
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được hãng xe");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Brand) => {
    if (!confirm(`Xóa hãng "${item.brandName}"?`)) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/api/brands/${item.brandId}`);
      if (editingId === item.brandId) reset();
      setMessage("Đã xóa hãng xe");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được hãng xe");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hãng xe</h1>
      <p className="mt-1 text-sm text-slate-500">Thêm, sửa danh mục hãng xe dùng khi đăng xe mới.</p>
      {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <form onSubmit={submit} className="mt-5 rounded-2xl border bg-white p-4">
        <p className="text-sm font-bold text-slate-900">
          {editingId ? "Sửa hãng xe" : "Thêm hãng xe"}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Tên hãng (Toyota, Kia, VinFast...)"
            className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả (Hãng xe Nhật Bản...)"
            className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm hãng"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2.5 text-sm text-slate-600"
              >
                <X className="h-4 w-4" /> Hủy
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th>Tên hãng</th>
              <th>Mô tả</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.brandId} className="border-t">
                <td className="px-4 py-3 text-slate-500">{item.brandId}</td>
                <td className="font-medium">{item.brandName}</td>
                <td>{item.description || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Chưa có hãng xe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
