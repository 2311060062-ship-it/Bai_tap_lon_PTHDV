"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import type { CarType } from "@/lib/types";

type PageRes = {
  totalElements: number;
  content: { id: number; typeName: string }[];
  pageSize: number;
  page: number;
  totalPages: number;
};

export default function AdminCarTypesPage() {
  const [items, setItems] = useState<CarType[]>([]);
  const [typeName, setTypeName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = (nextPage = page, nextKeyword = keyword, nextSize = pageSize) =>
    api
      .get<PageRes>("/api/car-types/page", {
        params: { keyword: nextKeyword.trim() || undefined, page: nextPage, pageSize: nextSize },
      })
      .then((res) => {
        setItems((res.data.content || []).map((row) => ({ carTypeId: row.id, typeName: row.typeName })));
        setPage(res.data.page || 1);
        setPageSize(res.data.pageSize || nextSize);
        setTotalPages(Math.max(1, res.data.totalPages || 1));
        setTotalElements(res.data.totalElements || 0);
      })
      .catch(() => {
        setItems([]);
        setTotalPages(1);
        setTotalElements(0);
      });

  useEffect(() => {
    load(1, "", 10);
  }, []);

  const reset = () => {
    setEditingId(null);
    setTypeName("");
    setError("");
  };

  const startEdit = (item: CarType) => {
    setEditingId(item.carTypeId);
    setTypeName(item.typeName);
    setError("");
    setMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!typeName.trim()) {
      setError("Nhập tên loại xe");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const body = { typeName: typeName.trim() };
    try {
      if (editingId) {
        await api.put(`/api/car-types/${editingId}`, body);
        setMessage("Đã cập nhật loại xe");
      } else {
        await api.post("/api/car-types", body);
        setMessage("Đã thêm loại xe");
      }
      reset();
      await load(1, keyword, pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được loại xe");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: CarType) => {
    if (!confirm(`Xóa loại "${item.typeName}"?`)) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/api/car-types/${item.carTypeId}`);
      if (editingId === item.carTypeId) reset();
      setMessage("Đã xóa loại xe");
      await load(page, keyword, pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được loại xe");
    }
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    void load(1, keyword, pageSize);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Loại xe</h1>
      <p className="mt-1 text-sm text-slate-500">Thêm, sửa danh mục loại xe (Sedan, SUV, Hatchback...).</p>
      {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <form onSubmit={submit} className="mt-5 rounded-2xl border bg-white p-4">
        <p className="text-sm font-bold text-slate-900">
          {editingId ? "Sửa loại xe" : "Thêm loại xe"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="Tên loại (Sedan, SUV, MPV, Coupe...)"
            className="min-w-[240px] flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm loại"}
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
      </form>

      <form onSubmit={search} className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border bg-white p-4">
        <label className="text-xs font-semibold text-slate-600">
          keyword
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm loại xe..."
            className="mt-1 block min-w-[200px] rounded-xl border px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          page
          <input
            type="number"
            min={1}
            value={page}
            onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 block w-20 rounded-xl border px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          pageSize
          <input
            type="number"
            min={1}
            max={50}
            value={pageSize}
            onChange={(e) => setPageSize(Math.max(1, Number(e.target.value) || 10))}
            className="mt-1 block w-24 rounded-xl border px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          <Search className="h-4 w-4" /> Execute
        </button>
        <p className="ml-auto text-xs text-slate-400">
          {totalElements} phần tử · trang {page}/{totalPages}
        </p>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th>Loại xe</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.carTypeId} className="border-t">
                <td className="px-4 py-3 text-slate-500">{item.carTypeId}</td>
                <td className="font-medium">{item.typeName}</td>
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
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Chưa có loại xe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
