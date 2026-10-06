"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition – Bọc toàn bộ nội dung trang, thêm hiệu ứng fade+blur+scale
 * khi người dùng điều hướng sang trang khác.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit" | "idle">("idle");
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      // Start exit
      setTransitionStage("exit");

      const exitTimer = setTimeout(() => {
        prevPathRef.current = pathname;
        setDisplayChildren(children);
        setTransitionStage("enter");

        const enterTimer = setTimeout(() => {
          setTransitionStage("idle");
        }, 600);

        return () => clearTimeout(enterTimer);
      }, 280);

      return () => clearTimeout(exitTimer);
    } else {
      // Same page (initial load) — just enter
      setDisplayChildren(children);
      setTransitionStage("enter");
      const t = setTimeout(() => setTransitionStage("idle"), 600);
      return () => clearTimeout(t);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls =
    transitionStage === "enter"
      ? "page-transition-enter"
      : transitionStage === "exit"
      ? "page-transition-exit"
      : "";

  return (
    <div className={cls} style={{ willChange: "transform, opacity, filter" }}>
      {displayChildren}
    </div>
  );
}
