/** Số Zalo mặc định nếu admin chưa lưu số riêng. Hotline 1900 không mở được Zalo. */
export const COMPANY_ZALO_PHONE = "0987654321";
export const COMPANY_HOTLINE = "19006868";
export const COMPANY_HOTLINE_LABEL = "1900 6868";
export const COMPANY_EMAIL = "support@carrental.vn";
export const SHOP_ZALO_STORAGE_KEY = "car_rental_shop_zalo";
export const SHOP_ZALO_EVENT = "shop-zalo-changed";

export function digitsOnly(value?: string | null): string {
  return (value || "").replace(/\D/g, "");
}

/** Chuẩn hoá SĐT VN: +84 / 84 → 0..., bỏ khoảng trắng. */
export function normalizeVnMobile(phone?: string | null): string {
  let digits = digitsOnly(phone);
  if (digits.startsWith("84") && digits.length >= 11) {
    digits = `0${digits.slice(2)}`;
  }
  if (/^0[3-9]\d{8}$/.test(digits)) return digits;
  return "";
}

export function getShopZaloPhone(): string {
  if (typeof window !== "undefined") {
    const saved = normalizeVnMobile(localStorage.getItem(SHOP_ZALO_STORAGE_KEY));
    if (saved) return saved;
  }
  return COMPANY_ZALO_PHONE;
}

export function cacheShopZaloPhone(phone: string): string {
  const normalized = normalizeVnMobile(phone);
  if (!normalized) return getShopZaloPhone();
  if (typeof window !== "undefined") {
    localStorage.setItem(SHOP_ZALO_STORAGE_KEY, normalized);
    window.dispatchEvent(new CustomEvent(SHOP_ZALO_EVENT, { detail: normalized }));
  }
  return normalized;
}

export function zaloChatUrl(phone?: string | null, text?: string): string {
  const target = normalizeVnMobile(phone) || getShopZaloPhone();
  const url = `https://zalo.me/${target}`;
  return text?.trim() ? `${url}?text=${encodeURIComponent(text.trim())}` : url;
}

export function companyZaloUrl(text?: string, shopPhone?: string | null): string {
  return zaloChatUrl(shopPhone || getShopZaloPhone(), text);
}

export function formatPhoneLabel(phone?: string | null): string {
  const mobile = normalizeVnMobile(phone);
  if (mobile) return `${mobile.slice(0, 4)} ${mobile.slice(4, 7)} ${mobile.slice(7)}`;
  const raw = (phone || "").trim();
  return raw || "Chưa có số";
}

export function canOpenZalo(phone?: string | null): boolean {
  return Boolean(normalizeVnMobile(phone));
}
