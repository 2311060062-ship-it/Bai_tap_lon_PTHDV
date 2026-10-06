"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progressPercent = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(progressPercent);
      setVisible(scrolled > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  // Circle progress calculations
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Cuộn lên đầu trang"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full bg-white p-1 text-brand-500 shadow-lift transition-all duration-300 hover:scale-110 hover:shadow-glow focus:outline-none"
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2D5BFF"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-150"
        />
      </svg>
      <span className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white transition-colors duration-300 hover:bg-brand-600">
        <ArrowUp className="h-5 w-5" />
      </span>
    </button>
  );
}
