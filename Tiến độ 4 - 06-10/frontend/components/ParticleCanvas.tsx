"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

// Màu nhẹ, bão hòa thấp – không gây lóa
const COLORS = [
  "rgba(45, 91, 255, 0.25)",
  "rgba(59, 130, 246, 0.2)",
  "rgba(245, 197, 66, 0.18)",
  "rgba(255, 255, 255, 0.2)",
  "rgba(148, 163, 184, 0.15)",
];

export function ParticleCanvas({ count = 35 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Tốc độ rất chậm để không gây chú ý quá
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28 - 0.08,
      radius: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.45 + 0.12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;

        // Vẽ hạt – không có glow shadow để bớt chói
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });

      // Dây kết nối – opacity rất thấp, ngưỡng khoảng cách nhỏ hơn
      particlesRef.current.forEach((p1, i) => {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 75) {
            ctx.save();
            ctx.globalAlpha = ((75 - dist) / 75) * 0.07;
            ctx.strokeStyle = "rgba(200, 210, 255, 0.8)";
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      // Giảm opacity tổng xuống 50% để không lóa
      className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
      aria-hidden="true"
    />
  );
}
