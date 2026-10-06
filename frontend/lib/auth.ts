"use client";

import type { User } from "./types";

export type AuthPortal = "customer" | "admin";

const CUSTOMER_USER_KEY = "car_rental_user";
const CUSTOMER_TOKEN_KEY = "token";
const CUSTOMER_REFRESH_KEY = "refresh_token";
const ADMIN_USER_KEY = "car_rental_admin";
const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_REFRESH_KEY = "admin_refresh_token";

function keys(portal: AuthPortal) {
  return portal === "admin"
    ? { user: ADMIN_USER_KEY, token: ADMIN_TOKEN_KEY, refresh: ADMIN_REFRESH_KEY }
    : { user: CUSTOMER_USER_KEY, token: CUSTOMER_TOKEN_KEY, refresh: CUSTOMER_REFRESH_KEY };
}

function readStore(portal: AuthPortal): Storage | null {
  if (typeof window === "undefined") return null;
  const { user, token, refresh } = keys(portal);
  if (localStorage.getItem(token) || localStorage.getItem(user) || localStorage.getItem(refresh)) return localStorage;
  if (sessionStorage.getItem(token) || sessionStorage.getItem(user) || sessionStorage.getItem(refresh)) return sessionStorage;
  return localStorage;
}

function readJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const exp = readJwtExp(token);
  if (exp == null) return false;
  return exp * 1000 <= Date.now() + skewSeconds * 1000;
}

function rawItem(portal: AuthPortal, kind: "token" | "refresh" | "user"): string | null {
  if (typeof window === "undefined") return null;
  const store = readStore(portal);
  return store?.getItem(keys(portal)[kind]) ?? null;
}

function isSessionAlive(portal: AuthPortal): boolean {
  const token = rawItem(portal, "token");
  const refresh = rawItem(portal, "refresh");
  if (refresh && !isJwtExpired(refresh)) return true;
  if (token && !isJwtExpired(token)) return true;
  if (token && readJwtExp(token) == null) return true;
  return false;
}

function pruneExpiredSession(portal: AuthPortal) {
  const token = rawItem(portal, "token");
  const refresh = rawItem(portal, "refresh");
  if (!token && !refresh) return;
  if (isSessionAlive(portal)) return;
  clearAuth(portal);
}

function migrateLegacyAdmin() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY)) return;
  const store =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ? localStorage
      : sessionStorage.getItem(CUSTOMER_TOKEN_KEY) ? sessionStorage
        : null;
  if (!store) return;
  const raw = store.getItem(CUSTOMER_USER_KEY);
  const token = store.getItem(CUSTOMER_TOKEN_KEY);
  if (!raw || !token) return;
  try {
    const user = JSON.parse(raw) as User;
    if (user.role !== "ADMIN") return;
    saveAuth(token, user, store === localStorage, "admin", store.getItem(CUSTOMER_REFRESH_KEY) || undefined);
    store.removeItem(CUSTOMER_TOKEN_KEY);
    store.removeItem(CUSTOMER_USER_KEY);
    store.removeItem(CUSTOMER_REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export function isRemembered(portal: AuthPortal = "customer") {
  if (typeof window === "undefined") return true;
  const { user, token, refresh } = keys(portal);
  return !!(localStorage.getItem(token) || localStorage.getItem(user) || localStorage.getItem(refresh));
}

export function saveAuth(
  token: string,
  user: User,
  remember = true,
  portal: AuthPortal = "customer",
  refreshToken?: string,
) {
  const existingRefresh = refreshToken !== undefined
    ? (refreshToken || null)
    : (typeof window !== "undefined" ? rawItem(portal, "refresh") : null);
  clearAuth(portal);
  const store = remember ? localStorage : sessionStorage;
  const { user: userKey, token: tokenKey, refresh: refreshKey } = keys(portal);
  store.setItem(tokenKey, token);
  store.setItem(userKey, JSON.stringify(user));
  if (existingRefresh) store.setItem(refreshKey, existingRefresh);
}

export function clearAuth(portal: AuthPortal = "customer") {
  const { user, token, refresh } = keys(portal);
  [localStorage, sessionStorage].forEach((store) => {
    store.removeItem(token);
    store.removeItem(user);
    store.removeItem(refresh);
  });
}

export function getToken(portal: AuthPortal = "customer") {
  if (portal === "admin") migrateLegacyAdmin();
  pruneExpiredSession(portal);
  return rawItem(portal, "token");
}

export function getRefreshToken(portal: AuthPortal = "customer") {
  if (portal === "admin") migrateLegacyAdmin();
  pruneExpiredSession(portal);
  return rawItem(portal, "refresh");
}

export function getCurrentUser(portal: AuthPortal = "customer"): User | null {
  if (portal === "admin") migrateLegacyAdmin();
  pruneExpiredSession(portal);
  const raw = rawItem(portal, "user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as User;
    if (portal === "customer" && user.role === "ADMIN") {
      migrateLegacyAdmin();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function isAdminSession() {
  return getCurrentUser("admin")?.role === "ADMIN" && isSessionAlive("admin");
}

/** @deprecated Dùng isAdminSession() cho cổng quản trị */
export function isAdmin() {
  return isAdminSession();
}

export function currentPortal(): AuthPortal {
  if (typeof window === "undefined") return "customer";
  return window.location.pathname.startsWith("/admin") ? "admin" : "customer";
}

export function loginPath(portal: AuthPortal = currentPortal()) {
  return portal === "admin" ? "/admin/login" : "/login";
}

export function needsEmailVerification(user: User | null) {
  if (!user || user.role === "ADMIN") return false;
  return user.emailVerified === false;
}
