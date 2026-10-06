"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { api, uploadImage } from "@/lib/api";
import { carStatusLabel, money } from "@/lib/labels";
import { RentalCountdown } from "@/components/RentalCountdown";
import { formatLicensePlate, isValidLicensePlate } from "@/lib/licensePlate";
import { formatVndInput, parseVndInput, priceSuggestions, PRICE_PRESETS } from "@/lib/vnd";
import { mediaUrl } from "@/lib/media";
import { LocationPicker } from "@/components/LocationPicker";
import type { Brand, Car, CarType } from "@/lib/types";

const emptyForm = {
  carName: "",
  location: "Hà Nội",
  quantity: 1,
  brandId: "",
  carTypeId: "",
  price: 800000,
  unit: "DAY",
  imageUrl: "",
  color: "Trắng",
  fuelType: "Xăng",
  engine: "1.5L",
  seatCount: 5,
  year: 2024,
  licensePlate: "",
  description: "",
  latitude: "21.0285",
  longitude: "105.8542",
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<CarType[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string>("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [priceText, setPriceText] = useState(formatVndInput(emptyForm.price));
  const [plateError, setPlateError] = useState("");

  const resetForm = (nextBrands = brands, nextTypes = types) => {
    setEditingId(null);
    setPlateError("");
    setPriceText(formatVndInput(emptyForm.price));
    setPreview("");
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }
    setForm({
      ...emptyForm,
      brandId: nextBrands[0] ? String(nextBrands[0].brandId) : "",
      carTypeId: nextTypes[0] ? String(nextTypes[0].carTypeId) : "",
    });
  };

  const load = async () => {
    try {
      const [carRes, brandRes, typeRes] = await Promise.all([
        api.get("/api/cars"),
        api.get("/api/brands"),
        api.get("/api/car-types"),
      ]);
      setCars(carRes.data);
      setBrands(brandRes.data);
      setTypes(typeRes.data);
      setForm((f) => ({
        ...f,
        brandId: f.brandId || (brandRes.data[0] ? String(brandRes.data[0].brandId) : ""),
        carTypeId: f.carTypeId || (typeRes.data[0] ? String(typeRes.data[0].carTypeId) : ""),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách xe");
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const pickFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Chỉ nhận tệp ảnh JPG, PNG, WEBP hoặc GIF");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Ảnh tối đa 8MB");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const local = URL.createObjectURL(file);
    previewRef.current = local;
    setPreview(local);
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const url = await uploadImage(file);
      setForm((current) => ({ ...current, imageUrl: url }));
      setMessage("Đã tải ảnh lên");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.carName.trim()) {
      setError("Nhập tên xe");
      return;
    }
    if (!form.brandId) {
      setError("Hãy chọn hãng xe. Nếu danh sách trống, vào mục Hãng xe để thêm trước.");
      return;
    }
    if (!form.carTypeId) {
      setError("Hãy chọn loại xe. Nếu danh sách trống, vào mục Loại xe để thêm trước.");
      return;
    }
    if (form.licensePlate && !isValidLicensePlate(form.licensePlate)) {
      setPlateError("Biển số phải theo dạng 30A-123.45 hoặc 51A-999.88");
      setError("Biển số chưa đúng định dạng Việt Nam.");
      return;
    }
    if (uploading) {
      setError("Đang tải ảnh, đợi xong rồi bấm Thêm xe.");
      return;
    }
    const price = parseVndInput(priceText);
    if (price < 100000) {
      setError("Giá thuê / ngày tối thiểu 100.000 đ");
      return;
    }
    const payload = {
      carName: form.carName.trim(),
      location: form.location.trim() || "Hà Nội",
      quantity: Number(form.quantity) || 1,
      brandId: Number(form.brandId),
      carTypeId: Number(form.carTypeId),
      price,
      unit: form.unit || "DAY",
      imageUrl: form.imageUrl.startsWith("blob:") || form.imageUrl.startsWith("data:") ? "" : form.imageUrl,
      color: form.color,
      fuelType: form.fuelType,
      engine: form.engine,
      seatCount: Number(form.seatCount) || 5,
      year: Number(form.year) || 2024,
      licensePlate: form.licensePlate.trim(),
      description: form.description.slice(0, 255),
      latitude: form.latitude ? Number(form.latitude) : 21.0285,
      longitude: form.longitude ? Number(form.longitude) : 105.8542,
      status: "AVAILABLE" as const,
    };
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/cars/${editingId}`, payload);
        setMessage("Đã cập nhật xe");
      } else {
        await api.post("/api/cars", payload);
        setMessage("Đã thêm xe");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu xe thất bại");
    } finally {
      setSaving(false);
    }
  };

  const edit = (car: Car) => {
    setEditingId(car.carId);
    setPlateError("");
    setError("");
    setMessage("");
    setPriceText(formatVndInput(car.price || 0));
    setPreview("");
    setForm({
      carName: car.carName,
      location: car.location || "Hà Nội",
      quantity: car.quantity || 1,
      brandId: String(car.brandId),
      carTypeId: String(car.carTypeId),
      price: Number(car.price || 0),
      unit: car.unit || "DAY",
      imageUrl: car.imageUrl || "",
      color: car.color || "",
      fuelType: car.fuelType || "",
      engine: car.engine || "",
      seatCount: car.seatCount || 5,
      year: car.year || 2024,
      licensePlate: car.licensePlate || "",
      description: car.description || "",
      latitude: car.latitude != null ? String(car.latitude) : "21.0285",
      longitude: car.longitude != null ? String(car.longitude) : "105.8542",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa xe này?")) return;
    try {
      await api.delete(`/api/cars/${id}`);
      setMessage("Đã xóa xe");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa xe thất bại");
    }
  };

  const imageSrc = preview || mediaUrl(form.imageUrl);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Quản lý xe</h1>
      <form onSubmit={create} className="mt-4 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-2">
        <label className="text-sm text-slate-600">
          Tên xe
          <input placeholder="Toyota Vios 2024" value={form.carName} onChange={(e) => setForm({ ...form, carName: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" required />
        </label>
        <label className="text-sm text-slate-600">
          Địa điểm
          <input placeholder="Tự điền khi chọn bản đồ" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm text-slate-600">
          Hãng xe
          <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" required>
            {brands.length === 0 && <option value="">Chưa có hãng xe</option>}
            {brands.map((b) => <option key={b.brandId} value={b.brandId}>{b.brandName}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Loại xe
          <select value={form.carTypeId} onChange={(e) => setForm({ ...form, carTypeId: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" required>
            {types.length === 0 && <option value="">Chưa có loại xe</option>}
            {types.map((t) => <option key={t.carTypeId} value={t.carTypeId}>{t.typeName}</option>)}
          </select>
        </label>

        <div className="text-sm text-slate-600">
          <label>
            Giá thuê / ngày
            <input
              inputMode="numeric"
              placeholder="800.000"
              value={priceText}
              onChange={(e) => {
                const next = formatVndInput(e.target.value);
                setPriceText(next);
                setForm({ ...form, price: parseVndInput(next) });
              }}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </label>
          <p className="mt-1 text-xs text-slate-400">Gõ 800 sẽ được hiểu là 800.000 đ — không cần nhập từng đồng.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setPriceText(formatVndInput(item)); setForm({ ...form, price: item }); }}
                className={`rounded-full border px-2.5 py-1 text-xs ${form.price === item ? "border-[#2D5BFF] bg-[#E8EEFF] text-[#2D5BFF]" : "border-slate-200 text-slate-600"}`}
              >
                {formatVndInput(item)} đ
              </button>
            ))}
          </div>
          {priceSuggestions(priceText).filter((item) => item !== form.price).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {priceSuggestions(priceText).filter((item) => item !== form.price).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setPriceText(formatVndInput(item)); setForm({ ...form, price: item }); }}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                >
                  Dùng {formatVndInput(item)} đ
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-slate-600">
          <label>
            Biển số xe
            <input
              placeholder="30A-123.45 (không bắt buộc)"
              value={form.licensePlate}
              onChange={(e) => {
                const next = formatLicensePlate(e.target.value);
                setForm({ ...form, licensePlate: next });
                setPlateError(next && !isValidLicensePlate(next) ? "Định dạng: 30A-123.45" : "");
              }}
              className="mt-1 w-full rounded-xl border px-3 py-2 uppercase"
            />
          </label>
          <p className="mt-1 text-xs text-slate-400">Tự thêm dấu - và . Ví dụ: 30A12345 → 30A-123.45</p>
          {plateError && <p className="mt-1 text-xs text-rose-600">{plateError}</p>}
        </div>

        <label className="text-sm text-slate-600">
          Màu xe
          <input placeholder="Trắng" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm text-slate-600">
          Nhiên liệu
          <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2">
            <option>Xăng</option>
            <option>Dầu</option>
            <option>Điện</option>
            <option>Hybrid</option>
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Động cơ
          <input placeholder="1.5L" value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm text-slate-600">
          Số chỗ ngồi
          <input type="number" min={2} max={16} value={form.seatCount} onChange={(e) => setForm({ ...form, seatCount: Number(e.target.value) || 5 })} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm text-slate-600">
          Năm sản xuất
          <input type="number" min={1990} max={2030} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) || 2024 })} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm text-slate-600">
          Số lượng
          <input type="number" min={1} max={99} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>

        <div
          className={`rounded-2xl border border-dashed p-3 md:col-span-2 ${dragOver ? "border-[#2D5BFF] bg-[#E8EEFF]" : "border-slate-200 bg-slate-50"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) pickFile(file);
          }}
        >
          <p className="mb-2 text-sm font-medium text-slate-700">Ảnh xe</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pickFile(file);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            {imageSrc ? (
              <img src={imageSrc} alt="Ảnh xe" className="h-24 w-36 rounded-xl object-cover" />
            ) : (
              <div className="flex h-24 w-36 items-center justify-center rounded-xl bg-white text-slate-400">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "#2D5BFF" }}
                disabled={uploading}
              >
                {uploading ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
              </button>
              <p className="mt-1 text-xs text-slate-400">Kéo thả ảnh vào đây. JPG/PNG, tối đa 8MB. Có thể thêm xe khi chưa có ảnh.</p>
            </div>
            {(form.imageUrl || preview) && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, imageUrl: "" });
                  setPreview("");
                  if (previewRef.current) {
                    URL.revokeObjectURL(previewRef.current);
                    previewRef.current = "";
                  }
                }}
                className="text-sm text-slate-500"
              >
                Xóa ảnh
              </button>
            )}
          </div>
        </div>

        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          location={form.location}
          onChange={(next) => setForm({ ...form, ...next })}
        />

        <label className="text-sm text-slate-600 md:col-span-2">
          Mô tả
          <textarea
            placeholder="Mô tả ngắn về xe"
            value={form.description}
            maxLength={255}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={3}
          />
          <span className="text-xs text-slate-400">{form.description.length}/255</span>
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button
            className="flex-1 rounded-xl bg-brand-700 py-2 text-white disabled:opacity-60"
            disabled={saving || uploading}
          >
            {saving ? "Đang lưu..." : editingId ? "Cập nhật xe" : "Thêm xe"}
          </button>
          {editingId && (
            <button type="button" onClick={() => resetForm()} className="rounded-xl border px-4 py-2 text-sm text-slate-600">
              Hủy sửa
            </button>
          )}
        </div>
      </form>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {message && !error && <p className="mt-3 text-sm text-brand-700">{message}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Xe</th>
              <th>Hãng</th>
              <th>Biển số</th>
              <th>Giá / ngày</th>
              <th>Trạng thái</th>
              <th>Còn lại</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.carId} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {car.imageUrl && <img src={mediaUrl(car.imageUrl)} alt="" className="h-10 w-14 rounded object-cover" />}
                    {car.carName}
                  </div>
                </td>
                <td>{car.brandName}</td>
                <td>{car.licensePlate || "—"}</td>
                <td>{money(car.price)}</td>
                <td>{carStatusLabel[car.status] || car.status}</td>
                <td>
                  {car.status === "UNAVAILABLE" && car.rentedUntil ? (
                    <RentalCountdown until={car.rentedUntil} from={car.rentedFrom} compact />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="space-x-2">
                  <button onClick={() => edit(car)} className="text-brand-700">Sửa</button>
                  <button onClick={() => remove(car.carId)} className="text-accent-600">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
