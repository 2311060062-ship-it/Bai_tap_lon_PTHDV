"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { api } from "@/lib/api";
import { isAdminSession, saveAuth } from "@/lib/auth";
import { AdminShieldBadge } from "@/components/Logo";

/* ─── Animated Security Shield Scene (left panel) ─── */
function SecurityScene() {
  const pulseRef = useRef<number>(0);
  const [rings, setRings] = useState([0, 0, 0]);

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.012;
      setRings([
        Math.sin(t) * 0.5 + 0.5,
        Math.sin(t + 1.2) * 0.5 + 0.5,
        Math.sin(t + 2.4) * 0.5 + 0.5,
      ]);
      pulseRef.current = requestAnimationFrame(tick);
    };
    pulseRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(pulseRef.current);
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden select-none">
      {/* Stars */}
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className="pointer-events-none absolute rounded-full bg-amber-200"
          style={{
            width: Math.random() * 2 + 0.8, height: Math.random() * 2 + 0.8,
            top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`,
            opacity: Math.random() * 0.4 + 0.05,
            animation: `starT ${(Math.random() * 4 + 2).toFixed(1)}s ease-in-out infinite`,
            animationDelay: `${(Math.random() * 3).toFixed(1)}s`,
          }}
        />
      ))}

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", filter: "blur(60px)", top: "10%", right: "5%", animation: "blobAmb 18s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute h-48 w-48 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #0066ff 0%, transparent 70%)", filter: "blur(70px)", bottom: "15%", left: "0%", animation: "blobAmb2 22s ease-in-out infinite" }} />

      {/* SVG scene */}
      <svg viewBox="0 0 280 320" className="h-full max-h-[360px] w-auto">
        <defs>
          <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>
          <linearGradient id="shieldInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a4a7f" />
            <stop offset="100%" stopColor="#162840" />
          </linearGradient>
          <radialGradient id="lockGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Pulse rings */}
        {rings.map((r, i) => (
          <circle key={i} cx="140" cy="155" r={70 + i * 28}
            fill="none" stroke="#f59e0b"
            strokeWidth="0.8"
            strokeOpacity={r * 0.18}
          />
        ))}

        {/* Glow behind shield */}
        <ellipse cx="140" cy="155" rx="70" ry="70" fill="url(#shieldGlow)" />

        {/* Shield body */}
        <path d="M140 60 L200 85 L200 145 Q200 200 140 230 Q80 200 80 145 L80 85 Z"
          fill="url(#shieldGrad)" stroke="rgba(251,191,36,0.35)" strokeWidth="2" />
        <path d="M140 72 L192 95 L192 145 Q192 193 140 220 Q88 193 88 145 L88 95 Z"
          fill="url(#shieldInner)" />

        {/* Shield highlight */}
        <path d="M140 72 L192 95 L192 115 Q175 100 140 95 Q105 100 88 115 L88 95 Z"
          fill="rgba(255,255,255,0.06)" />

        {/* Lock icon */}
        <g filter="url(#glow)">
          {/* Lock body */}
          <rect x="122" y="152" width="36" height="28" rx="5" fill="url(#lockGlow)" />
          {/* Lock shackle */}
          <path d="M130 152 L130 140 Q130 128 140 128 Q150 128 150 140 L150 152"
            fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
          {/* Keyhole */}
          <circle cx="140" cy="163" r="4" fill="#0a1628" />
          <rect x="138" y="163" width="4" height="6" rx="1" fill="#0a1628" />
        </g>

        {/* ADMIN text badge */}
        <rect x="110" y="240" width="60" height="22" rx="11" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.4)" strokeWidth="1" />
        <text x="140" y="255" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="2">ADMIN</text>

        {/* Corner dots decoration */}
        {[[55, 55], [225, 55], [55, 265], [225, 265]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="rgba(251,191,36,0.3)" />
        ))}
        {[[55, 55], [225, 55], [55, 265], [225, 265]].map(([x, y], i) => (
          <circle key={`p${i}`} cx={x} cy={y} r="6" fill="none" stroke="rgba(251,191,36,0.12)" strokeWidth="1" />
        ))}
      </svg>

      <style>{`
        @keyframes blobAmb  { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(-20px,25px)scale(1.06)} }
        @keyframes blobAmb2 { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(20px,-20px)scale(1.04)} }
        @keyframes starT    { 0%,100%{opacity:.05} 50%{opacity:.45} }
      `}</style>
    </div>
  );
}

/* ─── Admin Login Form ─────────────────────────────── */
export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminSession()) window.location.href = "/admin";
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { username, password });
      if (res.data.role !== "ADMIN") {
        setError("Tài khoản này là khách hàng. Hãy đăng nhập ở cổng khách.");
        return;
      }
      saveAuth(res.data.token, {
        userId: res.data.userId, username: res.data.username,
        fullName: res.data.fullName, email: "", role: res.data.role,
      }, remember, "admin", res.data.refreshToken || "");
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const AMBER = "#f59e0b";
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  };
  const focusStyle = {
    border: `1px solid rgba(245,158,11,0.6)`,
    boxShadow: "0 0 0 3px rgba(245,158,11,0.1)",
    background: "rgba(255,255,255,0.09)",
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020c18 0%, #041428 50%, #020c18 100%)" }}>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(245,158,11,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.8) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      {/* LEFT — Security Scene */}
      <div className="hidden lg:flex lg:w-[48%] items-center justify-center p-10">
        <div className="w-full max-w-[320px]">
          <SecurityScene />
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-extrabold text-white">Cổng Quản Trị</h2>
            <p className="mt-2 text-sm text-slate-400">
              Khu vực bảo mật — chỉ dành cho nhân viên được phân quyền.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Login card */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px] rounded-3xl p-8 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.042)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
            animation: "cardIn 0.65s cubic-bezier(0.16,1,0.3,1) both",
          }}>

          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <AdminShieldBadge size={56} />
            <div className="text-center">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest"
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: AMBER }}>
                🔒 RESTRICTED ACCESS
              </div>
              <h1 className="text-2xl font-extrabold text-white">Đăng Nhập Admin</h1>
              <p className="mt-0.5 text-xs text-slate-400">Dành riêng cho nhân viên quản trị hệ thống</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin" autoComplete="username" required
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type={showPassword ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu quản trị" autoComplete="current-password" required
                  className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded" style={{ accentColor: AMBER }} />
              Ghi nhớ phiên đăng nhập
            </label>

            {error && (
              <div className="rounded-xl p-3 text-xs font-medium text-rose-300"
                style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)" }}>
                {error}
                {error.includes("khách hàng") && (
                  <Link href="/login" className="mt-1 block font-bold hover:underline" style={{ color: AMBER }}>
                    Đến trang đăng nhập khách →
                  </Link>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#020c18",
                boxShadow: loading ? "none" : "0 0 22px rgba(245,158,11,0.3)",
              }}>
              <span className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)" }} />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>Đang xác thực...</>
                ) : (
                  <>Vào trang quản trị <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                )}
              </span>
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 rounded-2xl p-3 text-center text-[11px]"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <span className="text-slate-500">Demo: </span>
            <span className="font-bold" style={{ color: AMBER }}>admin / Admin@123</span>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-600">
            <Link href="/" className="transition hover:text-amber-400">← Về website khách hàng</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
