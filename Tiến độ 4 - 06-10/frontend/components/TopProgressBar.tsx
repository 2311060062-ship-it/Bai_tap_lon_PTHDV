"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * TopProgressBar – Thanh tiến trình mỏng phát sáng ở đầu trang
 * khi người dùng điều hướng sang trang mới.
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathRef = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;

      // Show bar
      setProgress(0);
      setVisible(true);

      // Animate to ~85% quickly
      let current = 0;
      timerRef.current = setInterval(() => {
        current += Math.random() * 18 + 8;
        if (current >= 85) {
          current = 85;
          clearInterval(timerRef.current);
        }
        setProgress(current);
      }, 80);

      // Complete after transition
      const completeTimer = setTimeout(() => {
        clearInterval(timerRef.current);
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 400);
      }, 500);

      return () => {
        clearInterval(timerRef.current);
        clearTimeout(completeTimer);
      };
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] w-full"
      aria-hidden
    >
      {/* Track */}
      <div className="h-full w-full bg-transparent" />

      {/* Progress fill */}
      <div
        className="absolute left-0 top-0 h-full rounded-r-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)",
          boxShadow: "0 0 6px rgba(59, 130, 246, 0.4)",
        }}
      >
        {/* Leading dot – nhỏ hơn, ít sáng hơn */}
        <span
          className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full"
          style={{
            background: "#93c5fd",
            boxShadow: "0 0 5px 2px rgba(147, 197, 253, 0.5)",
          }}
        />
      </div>
    </div>
  );
}
