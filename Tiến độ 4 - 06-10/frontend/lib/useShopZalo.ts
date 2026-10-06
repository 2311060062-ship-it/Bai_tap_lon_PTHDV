"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  COMPANY_ZALO_PHONE,
  SHOP_ZALO_EVENT,
  cacheShopZaloPhone,
  getShopZaloPhone,
  normalizeVnMobile,
} from "@/lib/support";

export function useShopZalo() {
  const [zaloPhone, setZaloPhone] = useState(COMPANY_ZALO_PHONE);

  useEffect(() => {
    setZaloPhone(getShopZaloPhone());
    api
      .get<{ zaloPhone?: string }>("/api/settings/public")
      .then((res) => {
        const next = normalizeVnMobile(res.data?.zaloPhone);
        if (next) setZaloPhone(cacheShopZaloPhone(next));
      })
      .catch(() => {});

    const onChange = (event: Event) => {
      const next = normalizeVnMobile((event as CustomEvent<string>).detail);
      if (next) setZaloPhone(next);
    };
    window.addEventListener(SHOP_ZALO_EVENT, onChange);
    return () => window.removeEventListener(SHOP_ZALO_EVENT, onChange);
  }, []);

  return zaloPhone;
}
