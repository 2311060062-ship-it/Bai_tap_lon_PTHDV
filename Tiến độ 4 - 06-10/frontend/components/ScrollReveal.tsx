"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollReveal – Dùng IntersectionObserver để kích hoạt class is-visible
 * lên các phần tử có class .reveal, .reveal-left, .reveal-right, .reveal-scale
 * khi chúng xuất hiện trong viewport.
 */
export function ScrollReveal() {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const initObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Once revealed, stop observing it
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    // Observe all reveal elements
    const targets = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );
    targets.forEach((el) => {
      // Reset if it was already revealed (page navigation)
      el.classList.remove("is-visible");
      observerRef.current?.observe(el);
    });
  };

  useEffect(() => {
    // Small delay to let the DOM settle after navigation
    const timer = setTimeout(initObserver, 80);
    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  return null;
}
