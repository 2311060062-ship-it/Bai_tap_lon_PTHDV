"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  clearAuth,
  currentPortal,
  getCurrentUser,
  getRefreshToken,
  getToken,
  isJwtExpired,
  isRemembered,
  loginPath,
  saveAuth,
  type AuthPortal,
} from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080",
  timeout: 20000,
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080",
  timeout: 20000,
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

function isFormData(data: unknown): data is FormData {
  return typeof FormData !== "undefined" && data instanceof FormData;
}

function isPublicAuthUrl(url?: string) {
  if (!url) return false;
  return /\/api\/auth\/(login|register|refresh|verify-email|resend-verification)\b/.test(url);
}

function redirectToLogin(portal: AuthPortal) {
  if (typeof window === "undefined") return;
  clearAuth(portal);
  const next = loginPath(portal);
  if (window.location.pathname === next) return;
  window.location.href = next;
}

async function refreshSession(portal: AuthPortal): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = getRefreshToken(portal);
    if (!refreshToken || isJwtExpired(refreshToken)) {
      throw new Error("Phiên đăng nhập hết hạn. Hãy đăng nhập lại.");
    }
    const res = await refreshClient.post("/api/auth/refresh", { refreshToken });
    const user = getCurrentUser(portal);
    if (!user) throw new Error("Phiên đăng nhập hết hạn. Hãy đăng nhập lại.");
    saveAuth(
      res.data.token,
      {
        ...user,
        userId: res.data.userId ?? user.userId,
        username: res.data.username ?? user.username,
        fullName: res.data.fullName ?? user.fullName,
        role: res.data.role ?? user.role,
      },
      isRemembered(portal),
      portal,
      res.data.refreshToken,
    );
    return res.data.token as string;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const portal = currentPortal();
    let token = getToken(portal);
    if (token && isJwtExpired(token) && !isPublicAuthUrl(config.url)) {
      try {
        token = await refreshSession(portal);
      } catch {
        redirectToLogin(portal);
        return Promise.reject(new Error(
          portal === "admin"
            ? "Phiên quản trị hết hạn. Đăng nhập lại tại cổng Admin."
            : "Phiên đăng nhập hết hạn. Hãy đăng nhập lại.",
        ));
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (isFormData(config.data)) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
    config.timeout = Math.max(config.timeout ?? 0, 60000);
  }
  return config;
});

function extractError(error: AxiosError<{ message?: string }>): string {
  const data = error.response?.data;
  const raw = typeof data === "string" ? data : data?.message;
  if (typeof raw === "string" && /Apache Tomcat|<html/i.test(raw)) {
    return "Cổng 8080 đang bị Tomcat XAMPP chiếm. Tắt Tomcat, chạy lại CarRentalBackendApplication.";
  }
  if (typeof raw === "string" && raw.trim()) return raw;
  if (error.response?.status === 401) {
    return currentPortal() === "admin"
      ? "Phiên quản trị hết hạn. Đăng nhập lại tại cổng Admin."
      : "Phiên đăng nhập hết hạn. Hãy đăng nhập lại.";
  }
  if (error.response?.status === 403) return "Tài khoản này không có quyền quản trị.";
  if (error.response?.status === 404) return "Không tìm thấy API. Hãy Stop rồi Run lại Spring Boot trong IntelliJ.";
  if (error.response?.status === 413) return "Ảnh quá lớn. Tối đa 8MB.";
  if (error.code === "ECONNABORTED") return "Hết thời gian chờ. Ảnh có thể quá nặng hoặc máy chủ chậm.";
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Không kết nối được máy chủ (cổng 8080). Hãy chạy lại CarRentalBackendApplication trong IntelliJ.";
  }
  return error.message || "Có lỗi xảy ra";
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config as RetryConfig | undefined;
    const portal = currentPortal();
    const status = error.response?.status;
    const canRefresh =
      status === 401
      && original
      && !original._retry
      && !isPublicAuthUrl(original.url)
      && !!getRefreshToken(portal);

    if (canRefresh && original) {
      original._retry = true;
      try {
        const token = await refreshSession(portal);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        redirectToLogin(portal);
        return Promise.reject(new Error(extractError(error)));
      }
    }

    if (status === 401 && original && !isPublicAuthUrl(original.url)) {
      redirectToLogin(portal);
    }

    return Promise.reject(new Error(extractError(error)));
  },
);

export async function uploadImage(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  try {
    const res = await api.post<{ url: string }>("/api/uploads", data);
    if (!res.data?.url) throw new Error("Máy chủ không trả về đường dẫn ảnh");
    return res.data.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!/404|Không tìm thấy API/i.test(message)) throw err;
    const fallback = await api.post<{ url: string }>("/api/cars/images", data);
    if (!fallback.data?.url) throw new Error("Máy chủ không trả về đường dẫn ảnh");
    return fallback.data.url;
  }
}
