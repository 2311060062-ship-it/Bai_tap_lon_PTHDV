"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { LogoBadge } from "@/components/Logo";

/* ─── SVG Icons ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-2H12z" />
      <path fill="#34A853" d="M6.6 14.3l-.9.7-2.5 1.9A12 12 0 0 0 12 24c3.2 0 5.9-1 7.9-2.8l-3.1-2.4c-.9.6-2 1-3.2 1a7 7 0 0 1-6.6-4.6z" />
      <path fill="#4A90E2" d="M3.2 7.1A11.9 11.9 0 0 0 0 12c0 1.9.5 3.7 1.3 5.3l3.4-2.6A7 7 0 0 1 5 12c0-.9.2-1.8.5-2.6z" />
      <path fill="#FBBC05" d="M12 5c1.7 0 3.3.6 4.5 1.7l2.7-2.7C16.9 2 14.6 1 12 1 7.3 1 3.3 3.7 1.3 7.1l3.4 2.6A7 7 0 0 1 12 5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.54-4.7 1.32 0 2.7.24 2.7.24v2.97h-1.52c-1.5 0-1.97.93-1.97 1.89v2.26h3.35l-.54 3.49h-2.81V24C19.61 23.09 24 18.1 24 12.07z" />
    </svg>
  );
}

/* ─── Lamp + Car Scene (LEFT PANEL) ─────────────────────────── */
function LampCarScene() {
  const swingRef = useRef<SVGGElement>(null);
  const cordRef = useRef<SVGGElement>(null);
  const [swingAngle, setSwingAngle] = useState(0);

  /* Pendulum swing animation */
  useEffect(() => {
    let t = 0;
    let frame: number;
    const tick = () => {
      t += 0.018;
      const angle = Math.sin(t) * 6; // ±6° gentle swing
      setSwingAngle(angle);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Light cone vertices from lamp bottom */
  const lampX = 140;
  const lampY = 180;
  const coneW = 140;
  const coneH = 200;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Animated blob backgrounds */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #00ffc8 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "10%", left: "10%",
          animation: "lampBlob1 14s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute h-56 w-56 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #0066ff 0%, transparent 70%)",
          filter: "blur(70px)",
          bottom: "10%", right: "5%",
          animation: "lampBlob2 18s ease-in-out infinite",
        }}
      />

      {/* Stars / noise dots */}
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: `${Math.random() * 85}%`,
            left: `${Math.random() * 90}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `starTwinkle ${(Math.random() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
            animationDelay: `${(Math.random() * 3).toFixed(1)}s`,
          }}
        />
      ))}

      {/* Main lamp SVG scene */}
      <svg
        viewBox="0 0 280 420"
        className="h-full max-h-[440px] w-auto drop-shadow-2xl"
        aria-hidden
      >
        <defs>
          {/* Light cone gradient */}
          <radialGradient id="coneGrad" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
            <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.38" />
            <stop offset="40%" stopColor="#00c8ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#003366" stopOpacity="0" />
          </radialGradient>
          {/* Floor glow */}
          <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00ffc8" stopOpacity="0" />
          </radialGradient>
          {/* Lamp body gradient */}
          <linearGradient id="lampBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2a3e" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
          {/* Car body gradient */}
          <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>
          {/* Car roof */}
          <linearGradient id="carRoof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#243d5e" />
            <stop offset="100%" stopColor="#162840" />
          </linearGradient>
          {/* Window gradient */}
          <linearGradient id="winGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4dd9c0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1a7a6e" stopOpacity="0.5" />
          </linearGradient>
          {/* Headlight */}
          <radialGradient id="headlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ffc8" stopOpacity="0.3" />
          </radialGradient>
          {/* Wheel */}
          <radialGradient id="wheel" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#444" />
            <stop offset="60%" stopColor="#222" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          {/* Tyre shine */}
          <linearGradient id="tyreShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── Ceiling ── */}
        <rect x="0" y="0" width="280" height="14" fill="#111827" rx="0" />

        {/* ── Cord + Lamp group (swinging around top center) ── */}
        <g
          ref={cordRef}
          style={{
            transformOrigin: `${lampX}px 14px`,
            transform: `rotate(${swingAngle}deg)`,
            transition: "transform 0.05s linear",
          }}
        >
          {/* Cord */}
          <line
            x1={lampX} y1="14"
            x2={lampX} y2="105"
            stroke="#4b5563"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Lamp body */}
          <g ref={swingRef}>
            {/* Cap / socket */}
            <ellipse cx={lampX} cy="106" rx="14" ry="5" fill="#374151" />
            {/* Shade outer */}
            <path
              d={`M${lampX - 36} 145 L${lampX - 12} 106 L${lampX + 12} 106 L${lampX + 36} 145 Z`}
              fill="url(#lampBody)"
              stroke="#4b5563"
              strokeWidth="1"
            />
            {/* Shade inner highlight */}
            <path
              d={`M${lampX - 32} 143 L${lampX - 11} 109 L${lampX + 11} 109 L${lampX + 32} 143 Z`}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            {/* Bulb glow */}
            <ellipse cx={lampX} cy="140" rx="8" ry="5" fill="#00ffc8" opacity="0.85" />
            <ellipse cx={lampX} cy="140" rx="14" ry="9" fill="#00ffc8" opacity="0.15" />

            {/* Light cone */}
            <path
              d={`M${lampX - 16} 145 L${lampX - coneW / 2} ${lampY + coneH} L${lampX + coneW / 2} ${lampY + coneH} L${lampX + 16} 145 Z`}
              fill="url(#coneGrad)"
            />
          </g>
        </g>

        {/* ── Floor glow ellipse ── */}
        <ellipse
          cx={lampX}
          cy="370"
          rx="80"
          ry="22"
          fill="url(#floorGlow)"
          style={{ animation: "glowPulse 3s ease-in-out infinite" }}
        />

        {/* ──────────────────────────────────────────────────────
            CAR (viewed from side, parked in the light cone)
            ────────────────────────────────────────────────────── */}
        {/* Shadow under car */}
        <ellipse cx="140" cy="373" rx="72" ry="8" fill="rgba(0,0,0,0.5)" />

        {/* Car body – lower (chassis) */}
        <rect x="58" y="338" width="164" height="30" rx="6" fill="url(#carBody)" />

        {/* Car roof / cabin */}
        <path
          d="M88 338 Q96 308 108 302 L172 302 Q184 308 192 338 Z"
          fill="url(#carRoof)"
        />

        {/* Windshield front */}
        <path
          d="M170 338 Q180 322 186 310 L172 302 Q165 308 162 320 Z"
          fill="url(#winGrad)"
          opacity="0.85"
        />
        {/* Windshield rear */}
        <path
          d="M110 338 Q100 322 94 310 L108 302 Q115 308 118 320 Z"
          fill="url(#winGrad)"
          opacity="0.7"
        />
        {/* Side window */}
        <path
          d="M122 338 L125 316 L155 316 L158 338 Z"
          fill="url(#winGrad)"
          opacity="0.6"
        />

        {/* Windshield glare */}
        <path
          d="M173 338 Q176 328 180 315 L176 312 Q170 322 168 338 Z"
          fill="rgba(255,255,255,0.12)"
        />

        {/* Door line */}
        <line x1="140" y1="305" x2="140" y2="338" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Door handle front */}
        <rect x="152" y="325" width="12" height="3" rx="1.5" fill="rgba(255,255,255,0.25)" />
        {/* Door handle rear */}
        <rect x="110" y="325" width="12" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />

        {/* Front bumper */}
        <rect x="200" y="342" width="22" height="8" rx="3" fill="#0d2240" />
        {/* Rear bumper */}
        <rect x="58" y="342" width="22" height="8" rx="3" fill="#0d2240" />

        {/* Headlight (front) */}
        <ellipse cx="214" cy="346" rx="7" ry="4" fill="url(#headlight)" opacity="0.9" />
        <ellipse cx="214" cy="346" rx="12" ry="7" fill="#00ffc8" opacity="0.1" />

        {/* Tail light (rear) */}
        <rect x="64" y="342" width="10" height="6" rx="2" fill="#ff3333" opacity="0.8" />

        {/* Front wheel */}
        <circle cx="191" cy="364" r="16" fill="url(#wheel)" />
        <circle cx="191" cy="364" r="10" fill="#333" />
        <circle cx="191" cy="364" r="5" fill="#555" />
        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1={191 + 5.5 * Math.cos((a * Math.PI) / 180)}
            y1={364 + 5.5 * Math.sin((a * Math.PI) / 180)}
            x2={191 + 9.5 * Math.cos((a * Math.PI) / 180)}
            y2={364 + 9.5 * Math.sin((a * Math.PI) / 180)}
            stroke="#777"
            strokeWidth="1.5"
          />
        ))}
        <path d="M180 356 A16 16 0 0 1 196 355" fill="none" stroke="url(#tyreShine)" strokeWidth="3" />

        {/* Rear wheel */}
        <circle cx="89" cy="364" r="16" fill="url(#wheel)" />
        <circle cx="89" cy="364" r="10" fill="#333" />
        <circle cx="89" cy="364" r="5" fill="#555" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1={89 + 5.5 * Math.cos((a * Math.PI) / 180)}
            y1={364 + 5.5 * Math.sin((a * Math.PI) / 180)}
            x2={89 + 9.5 * Math.cos((a * Math.PI) / 180)}
            y2={364 + 9.5 * Math.sin((a * Math.PI) / 180)}
            stroke="#777"
            strokeWidth="1.5"
          />
        ))}
        <path d="M78 356 A16 16 0 0 1 94 355" fill="none" stroke="url(#tyreShine)" strokeWidth="3" />

        {/* Antenna */}
        <line x1="172" y1="302" x2="174" y2="285" stroke="#4b5563" strokeWidth="1.5" />
        <circle cx="174" cy="284" r="1.5" fill="#00ffc8" opacity="0.8" />
      </svg>

      {/* Embedded keyframes for the scene */}
      <style>{`
        @keyframes lampBlob1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-25px) scale(1.08); }
        }
        @keyframes lampBlob2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-18px,20px) scale(1.06); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.7; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; rx: 80; }
          50% { opacity: 1; rx: 88; }
        }
      `}</style>
    </div>
  );
}

/* ─── Login Form Component ───────────────────────────────────── */
function LoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { username, password });
      if (res.data.role === "ADMIN") {
        setError("Tài khoản quản trị hãy đăng nhập ở cổng Admin.");
        return;
      }
      const next = searchParams.get("next") || "/";
      if (next.startsWith("/admin")) { window.location.href = "/admin/login"; return; }
      saveAuth(res.data.token, {
        userId: res.data.userId,
        username: res.data.username,
        fullName: res.data.fullName,
        email: res.data.email || "",
        role: res.data.role,
        emailVerified: res.data.emailVerified !== false,
      }, remember, "customer", res.data.refreshToken || "");
      window.location.href = next;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
      if (/xác thực email/i.test(message)) {
        window.location.href = `/verify-email?email=${encodeURIComponent(username)}`;
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020c18 0%, #041428 50%, #020c18 100%)" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,200,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* LEFT — Lamp Scene (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[48%] items-center justify-center p-10">
        <div className="w-full max-w-[340px]">
          <LampCarScene />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-extrabold text-white">
              Chào mừng trở lại!
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Đăng nhập để khám phá hàng trăm xe sang trọng đang chờ bạn.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Login Card */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div
          className="w-full max-w-[420px] rounded-3xl p-8 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            animation: "cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Logo / Brand */}
          <div className="mb-7 flex flex-col items-center gap-3">
            <LogoBadge size={56} glow />
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-white">Đăng Nhập</h1>
              <p className="mt-0.5 text-xs text-slate-400">Kéo cần để thắp sáng hành trình của bạn</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tài khoản hoặc email"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(0,255,200,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,255,200,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(0,255,200,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,255,200,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-slate-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-600"
                  style={{ accentColor: "#00ffc8" }}
                />
                Ghi nhớ đăng nhập
              </label>
              <Link href="/contact" className="font-semibold text-[#00ffc8] transition hover:opacity-75">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Errors */}
            {error && (
              <div className="rounded-xl p-3 text-xs font-medium text-rose-300" style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)" }}>
                {error}
                {error.includes("quản trị") && (
                  <Link href="/admin/login" className="mt-1 block font-bold text-[#00ffc8] hover:underline">
                    Đến cổng quản trị →
                  </Link>
                )}
              </div>
            )}
            {info && (
              <div className="rounded-xl p-3 text-xs font-medium text-sky-300" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
                {info}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #00ffc8 0%, #00b4d8 100%)",
                color: "#020c18",
                boxShadow: loading ? "none" : "0 0 25px rgba(0,255,200,0.3)",
              }}
            >
              {/* Shimmer overlay on hover */}
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Đang xác thực...
                  </>
                ) : (
                  <>Đăng Nhập <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-[11px] text-slate-500">hoặc tiếp tục với</span>
            <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <GoogleIcon />, label: "Google" },
              { icon: <FacebookIcon />, label: "Facebook" },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => setInfo(`Đăng nhập ${btn.label} sẽ được tích hợp trong phiên bản tới.`)}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-slate-300 transition-all duration-200 hover:text-white active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

          {/* Footer links – nút chuyển trang có mũi tên chỉ hướng */}
          <div className="mt-6 flex items-center justify-center gap-1 text-xs text-slate-500">
            Chưa có tài khoản?
            <Link
              href="/register"
              className="group ml-1 inline-flex items-center gap-1 font-bold text-[#00ffc8] transition-all hover:gap-2 hover:opacity-90"
            >
              Đăng ký ngay
              <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Nhân viên quản trị?{" "}
            <Link href="/admin/login" className="font-semibold text-slate-400 transition hover:text-[#00ffc8]">
              Cổng Admin
            </Link>
          </p>
        </div>
      </div>

      {/* Global keyframes – login slide in từ trái (vì là index 0) */}
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-slate-500">Đang tải...</p>}>
      <LoginForm />
    </Suspense>
  );
}
