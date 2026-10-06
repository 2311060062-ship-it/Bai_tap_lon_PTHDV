"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Direction = "left" | "right" | "none";

/**
 * AuthTransition – Chuyển cảnh NGANG giữa các trang auth (login ↔ register).
 *
 * Nguyên lý:
 * - Cả trang cũ VÀ trang mới đều được render đồng thời trong một container tối.
 * - Trang cũ slide ra ngoài, trang mới slide vào cùng lúc → không có khoảng trống lộ nền trắng.
 * - login → register : slide sang trái  (→)
 * - register → login : slide sang phải (←)
 * - Các route khác trong auth: fade đơn giản
 */

const AUTH_ORDER: Record<string, number> = {
  "/login":    0,
  "/register": 1,
};

function getDirection(from: string, to: string): Direction {
  const a = AUTH_ORDER[from] ?? -1;
  const b = AUTH_ORDER[to]   ?? -1;
  if (a === -1 || b === -1) return "none";
  return b > a ? "left" : "right";
}

export function AuthTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [slots, setSlots] = useState<{
    outgoing: React.ReactNode;
    incoming: React.ReactNode;
    direction: Direction;
    phase: "idle" | "animating";
  }>({ outgoing: null, incoming: children, direction: "none", phase: "idle" });

  const prevPathRef   = useRef(pathname);
  const prevChildRef  = useRef(children);
  const animTimerRef  = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (pathname === prevPathRef.current) {
      // Initial mount
      prevChildRef.current = children;
      return;
    }

    const dir = getDirection(prevPathRef.current, pathname);

    // Kick off simultaneous slide
    setSlots({
      outgoing:  prevChildRef.current,
      incoming:  children,
      direction: dir,
      phase:     "animating",
    });

    clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => {
      // Animation done — show only the new page
      prevPathRef.current  = pathname;
      prevChildRef.current = children;
      setSlots({ outgoing: null, incoming: children, direction: "none", phase: "idle" });
    }, 480);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Idle: just render current page normally ──────────────────────────────
  if (slots.phase === "idle") {
    return (
      <div style={{ position: "relative", overflow: "hidden" }}>
        {slots.incoming}
      </div>
    );
  }

  // ── Animating: two pages side-by-side, sliding ───────────────────────────
  const DURATION = "0.46s";
  const EASE     = "cubic-bezier(0.32, 0, 0.12, 1)"; // iOS-like feel

  const outTranslate = slots.direction === "left"  ? "-100%" :
                       slots.direction === "right" ? "100%"  : "0";
  const inTranslate  = slots.direction === "left"  ? "100%"  :
                       slots.direction === "right" ? "-100%" : "0";

  return (
    /* Dark clip container — absolutely positioned, fills the screen */
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#020c18", // same dark as auth pages → NO white flash
      }}
    >
      {/* Outgoing page: slide out */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: `authSlideOut-${slots.direction} ${DURATION} ${EASE} both`,
        }}
      >
        {slots.outgoing}
      </div>

      {/* Incoming page: slide in */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: `authSlideIn-${slots.direction} ${DURATION} ${EASE} both`,
        }}
      >
        {slots.incoming}
      </div>

      {/* Keyframes injected inline so they apply only here */}
      <style>{`
        /* ── Slide LEFT (login → register) ── */
        @keyframes authSlideOut-left {
          from { transform: translateX(0);     opacity: 1; }
          to   { transform: translateX(-100%); opacity: 0.4; }
        }
        @keyframes authSlideIn-left {
          from { transform: translateX(100%); opacity: 0.4; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        /* ── Slide RIGHT (register → login) ── */
        @keyframes authSlideOut-right {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(100%); opacity: 0.4; }
        }
        @keyframes authSlideIn-right {
          from { transform: translateX(-100%); opacity: 0.4; }
          to   { transform: translateX(0);     opacity: 1; }
        }

        /* ── Fallback fade (other routes) ── */
        @keyframes authSlideOut-none {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes authSlideIn-none {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
