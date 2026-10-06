"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { ActionMenu } from "@/components/ActionMenu";
import { api } from "@/lib/api";
import { customerStatusLabel } from "@/lib/labels";
import type { Customer } from "@/lib/types";

const PAGE_SIZE = 10;

function statusBadge(status: string) {
  const tone =
    status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700"
      : status === "LOCKED"
        ? "bg-rose-100 text-rose-700"
        : "bg-[#2D5BFF] text-white";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {customerStatusLabel[status] || status}
    </span>
  );
}

type CustomerForm = {
  username: string;
  password: string;
  customerName: string;
  email: string;
  customerPhone: string;
  customerAddress: string;
  birthDate: string;
  idNumber: string;
  licenseNumber: string;
  status: string;
};

type Dialog =
  | { mode: "create" }
  | { mode: "view" | "edit"; item: Customer };

function emptyForm(): CustomerForm {
  return {
    username: "",
    password: "",
    customerName: "",
    email: "",
    customerPhone: "",
    customerAddress: "",
    birthDate: "",
    idNumber: "",
    licenseNumber: "",
    status: "ACTIVE",
  };
}

function toForm(item: Customer): CustomerForm {
  return {
    username: item.username || "",
    password: "",
    customerName: item.customerName || "",
    email: item.customerEmail || "",
    customerPhone: item.customerPhone || "",
    customerAddress: item.customerAddress || "",
    birthDate: item.birthDate ? item.birthDate.slice(0, 10) : "",
    idNumber: item.idNumber || "",
    licenseNumber: item.licenseNumber || "",
    status: item.status || "ACTIVE",
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const day = value.slice(0, 10);
  const [y, m, d] = day.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return date.toLocaleString("vi-VN");
}

export default function AdminCustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const load = () => {
    api.get("/api/customers", { params: { q: q || undefined } })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) =>
      item.customerName.toLowerCase().includes(keyword)
      || item.username?.toLowerCase().includes(keyword)
      || item.customerEmail?.toLowerCase().includes(keyword)
      || item.customerPhone?.includes(keyword)
      || item.customerAddress?.toLowerCase().includes(keyword),
    );
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openCreate = () => {
    setDialog({ mode: "create" });
    setForm(emptyForm());
    setShowPassword(false);
    setError("");
    setMessage("");
    setOpenMenu(null);
  };

  const openView = async (item: Customer) => {
    setOpenMenu(null);
    setError("");
    setShowPassword(false);
    try {
      const res = await api.get(`/api/customers/${item.customerId}`);
      setDialog({ mode: "view", item: res.data });
      setForm(toForm(res.data));
    } catch {
      setDialog({ mode: "view", item });
      setForm(toForm(item));
    }
  };

  const openEdit = (item: Customer) => {
    setDialog({ mode: "edit", item });
    setForm(toForm(item));
    setShowPassword(false);
    setError("");
    setOpenMenu(null);
  };

  const closeDialog = () => {
    setDialog(null);
    setShowPassword(false);
    setError("");
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!dialog || dialog.mode === "view") return;
    if (!form.customerName.trim()) {
      setError("Nhập tên khách hàng");
      return;
    }
    if (!form.email.trim()) {
      setError("Nhập email");
      return;
    }
    if (dialog.mode === "create") {
      if (!form.username.trim()) {
        setError("Nhập tên đăng nhập");
        return;
      }
      if (form.password.trim().length < 6) {
        setError("Mật khẩu tối thiểu 6 ký tự");
        return;
      }
    } else if (form.password && form.password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      customerPhone: form.customerPhone.trim(),
      customerAddress: form.customerAddress.trim(),
      birthDate: form.birthDate || null,
      idNumber: form.idNumber.trim(),
      licenseNumber: form.licenseNumber.trim(),
      status: form.status,
    };
    try {
      if (dialog.mode === "create") {
        await api.post("/api/customers", {
          ...payload,
          username: form.username.trim(),
          password: form.password,
        });
        setMessage("Đã thêm khách hàng mới");
      } else {
        await api.put(`/api/customers/${dialog.item.customerId}`, {
          ...payload,
          ...(form.password ? { password: form.password } : {}),
        });
        setMessage(form.password ? "Đã cập nhật thông tin và mật khẩu khách hàng" : "Đã cập nhật thông tin khách hàng");
      }
      setDialog(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được khách hàng");
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async (item: Customer) => {
    if (!item.userId) return;
    await api.patch(`/api/users/${item.userId}/lock`, { locked: item.status !== "LOCKED" });
    setOpenMenu(null);
    load();
  };

  const title =
    dialog?.mode === "create" ? "Thêm khách hàng"
      : dialog?.mode === "view" ? "Hồ sơ khách hàng"
        : "Chỉnh sửa khách hàng";
  const subtitle =
    dialog?.mode === "create" ? "Tạo tài khoản và hồ sơ khách mới"
      : dialog && dialog.mode !== "create" ? `${dialog.mode === "view" ? "Xem" : "Cập nhật"} hồ sơ #${dialog.item.customerId}`
        : "";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý khách hàng</h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2D5BFF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#244ce0]"
        >
          <Plus className="h-4 w-4" /> Thêm khách hàng
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, email, SĐT, tài khoản..."
            className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-600">
          <SlidersHorizontal className="h-4 w-4" /> Lọc
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="font-medium">Tên khách hàng</th>
              <th className="font-medium">Tài khoản</th>
              <th className="font-medium">Email</th>
              <th className="font-medium">Số điện thoại</th>
              <th className="font-medium">Địa chỉ</th>
              <th className="font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.customerId} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-500">{item.customerId}</td>
                <td className="font-medium text-slate-900">{item.customerName}</td>
                <td>{item.username || "—"}</td>
                <td>{item.customerEmail || "—"}</td>
                <td>{item.customerPhone || "—"}</td>
                <td>{item.customerAddress || "—"}</td>
                <td>{statusBadge(item.status)}</td>
                <td className="px-4 py-3">
                  <ActionMenu
                    open={openMenu === item.customerId}
                    onToggle={() => setOpenMenu(openMenu === item.customerId ? null : item.customerId)}
                    onClose={() => setOpenMenu(null)}
                    widthClass="w-44"
                  >
                    <button type="button" onClick={() => openView(item)} className="block w-full px-4 py-2 text-left hover:bg-slate-50">
                      Xem chi tiết
                    </button>
                    <button type="button" onClick={() => openEdit(item)} className="block w-full px-4 py-2 text-left hover:bg-slate-50">
                      Chỉnh sửa
                    </button>
                    {item.userId ? (
                      <button type="button" onClick={() => toggleLock(item)} className="block w-full px-4 py-2 text-left hover:bg-slate-50">
                        {item.status === "LOCKED" ? "Mở khóa" : "Khóa tài khoản"}
                      </button>
                    ) : (
                      <span className="block px-4 py-2 text-slate-400">Không có tài khoản</span>
                    )}
                  </ActionMenu>
                </td>
              </tr>
            ))}
            {!pageItems.length && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">Không tìm thấy khách hàng.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-slate-500">
          <span>Trang {page}/{totalPages}</span>
          <div className="flex gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={page <= 1 ? "text-slate-300" : "text-slate-600 hover:text-[#2D5BFF]"}
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={page >= totalPages ? "text-slate-300" : "text-slate-600 hover:text-[#2D5BFF]"}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={closeDialog}>
          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </div>
              <button type="button" onClick={closeDialog} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            {dialog.mode === "view" ? (
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <ViewField label="Tên khách hàng" value={dialog.item.customerName} wide />
                <ViewField label="Tài khoản" value={dialog.item.username} />
                <ViewField label="Email" value={dialog.item.customerEmail} />
                <ViewField label="Số điện thoại" value={dialog.item.customerPhone} />
                <ViewField label="Địa chỉ" value={dialog.item.customerAddress} wide />
                <ViewField label="Ngày sinh" value={formatDate(dialog.item.birthDate)} />
                <div className="text-sm text-slate-600">
                  Trạng thái
                  <div className="mt-1">{statusBadge(dialog.item.status)}</div>
                </div>
                <ViewField label="CCCD / CMND" value={dialog.item.idNumber} />
                <ViewField label="Số GPLX" value={dialog.item.licenseNumber} />
                <div className="text-sm text-slate-600 sm:col-span-2">
                  Mật khẩu
                  <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-900">
                    Đã mã hóa, không thể xem
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Dùng Chỉnh sửa để đặt mật khẩu mới.</p>
                </div>
                <ViewField label="Ngày tạo" value={formatDateTime(dialog.item.createdAt)} wide />
              </div>
            ) : (
              <div className="grid gap-3 p-6 sm:grid-cols-2">
                {dialog.mode === "create" && (
                  <>
                    <label className="text-sm text-slate-600">
                      Tên đăng nhập
                      <input
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                        required
                      />
                    </label>
                    <PasswordField
                      value={form.password}
                      onChange={(password) => setForm({ ...form, password })}
                      showPassword={showPassword}
                      onToggleShow={() => setShowPassword((v) => !v)}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </>
                )}
                {dialog.mode === "edit" && (
                  <>
                    <label className="text-sm text-slate-600">
                      Tên đăng nhập
                      <input
                        value={form.username}
                        readOnly
                        className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-slate-700"
                      />
                    </label>
                    <PasswordField
                      value={form.password}
                      onChange={(password) => setForm({ ...form, password })}
                      showPassword={showPassword}
                      onToggleShow={() => setShowPassword((v) => !v)}
                      placeholder="Để trống nếu không đổi"
                      hint="Nhập mật khẩu mới để đặt lại. Đăng nhập bằng tên tài khoản hoặc email."
                    />
                  </>
                )}
                <label className="text-sm text-slate-600 sm:col-span-2">
                  Tên khách hàng
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Số điện thoại
                  <input
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-600 sm:col-span-2">
                  Địa chỉ
                  <input
                    value={form.customerAddress}
                    onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Ngày sinh
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Trạng thái
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Ngừng</option>
                    <option value="LOCKED">Khóa</option>
                  </select>
                </label>
                <label className="text-sm text-slate-600">
                  CCCD / CMND
                  <input
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Số GPLX
                  <input
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />
                </label>
              </div>
            )}

            {error && <p className="px-6 pb-2 text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              {dialog.mode === "view" ? (
                <>
                  <button type="button" onClick={closeDialog} className="rounded-xl border px-4 py-2 text-sm text-slate-600">
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(dialog.item)}
                    className="rounded-xl bg-[#2D5BFF] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Chỉnh sửa
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={closeDialog} className="rounded-xl border px-4 py-2 text-sm text-slate-600">
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#2D5BFF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Đang lưu..." : dialog.mode === "create" ? "Thêm khách hàng" : "Lưu thay đổi"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ViewField({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={`text-sm text-slate-600 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  showPassword,
  onToggleShow,
  required,
  placeholder,
  hint,
  wide,
}: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm text-slate-600 ${wide ? "sm:col-span-2" : ""}`}>
      Mật khẩu
      <div className="relative mt-1">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 pr-10"
          minLength={6}
          required={required}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </label>
  );
}
