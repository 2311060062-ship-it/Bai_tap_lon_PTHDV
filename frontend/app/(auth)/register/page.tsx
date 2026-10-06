"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { LogoBadge } from "@/components/Logo";

/* ─── Field config ─────────────────────────────────────────── */
type FieldKey = "fullName" | "username" | "email" | "password" | "phone" | "address";

interface FieldConfig {
  key: FieldKey;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<FieldKey, string>>({
    fullName: "", username: "", email: "",
    password: "", phone: "", address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const FIELDS: FieldConfig[] = [
    { key: "fullName",  label: "Họ và tên",         type: "text",     placeholder: "Nguyễn Văn An",        icon: <UserCircle2 className="h-4 w-4" />, required: true  },
    { key: "username",  label: "Tên đăng nhập",      type: "text",     placeholder: "nguyenvanan",          icon: <User className="h-4 w-4" />,        required: true  },
    { key: "email",     label: "Email",               type: "email",    placeholder: "email@example.com",    icon: <Mail className="h-4 w-4" />,        required: true  },
    { key: "password",  label: "Mật khẩu",           type: "password", placeholder: "Tối thiểu 6 ký tự",   icon: <Lock className="h-4 w-4" />,        required: true  },
    { key: "phone",     label: "Số điện thoại",       type: "text",     placeholder: "0901 234 567",         icon: <Phone className="h-4 w-4" />,       required: false },
    { key: "address",   label: "Địa chỉ (tùy chọn)", type: "text",     placeholder: "Hà Nội",               icon: <MapPin className="h-4 w-4" />,      required: false },
  ];

  const focusStyle = {
    border: "1px solid rgba(0,255,200,0.5)",
    boxShadow: "0 0 0 3px rgba(0,255,200,0.08)",
    background: "rgba(255,255,255,0.1)",
  };
  const blurStyle = {
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "none",
    background: "rgba(255,255,255,0.07)",
  };

  return (
    <div
      className="relative flex min-h-screen w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020c18 0%, #041428 50%, #020c18 100%)" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,200,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 400, height: 400,
          top: "-15%", right: "-10%",
          background: "radial-gradient(circle, rgba(0,255,200,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "blobA 20s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 300, height: 300,
          bottom: "5%", left: "-8%",
          background: "radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)",
          filter: "blur(70px)",
          animation: "blobB 25s ease-in-out infinite",
        }}
      />

      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 0.8,
            height: Math.random() * 2 + 0.8,
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 95}%`,
            opacity: Math.random() * 0.45 + 0.05,
            animation: `starT ${(Math.random() * 4 + 2).toFixed(1)}s ease-in-out infinite`,
            animationDelay: `${(Math.random() * 4).toFixed(1)}s`,
          }}
        />
      ))}

      {/* Card */}
      <div className="relative z-10 flex w-full items-center justify-center px-5 py-10">
        <div
          className="w-full max-w-[500px] rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.042)",
            border: "1px solid rgba(255,255,255,0.11)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
            animation: "cardIn 0.65s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Header */}
          <div className="mb-7 flex flex-col items-center gap-3">
            <LogoBadge size={56} glow />
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-white">Tạo Tài Khoản</h1>
              <p className="mt-0.5 text-xs text-slate-400">Tham gia CarRental – Mã OTP sẽ được gửi tới Gmail đăng ký</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-3.5">
            <div className="grid gap-3.5 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.key} className={f.key === "address" ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      {f.icon}
                    </span>
                    <input
                      type={f.key === "password" ? (showPassword ? "text" : "password") : f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.required}
                      autoComplete={f.key === "password" ? "new-password" : f.key}
                      className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600"
                      style={blurStyle}
                      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                    />
                    {f.key === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div
                className="rounded-xl p-3 text-xs font-medium text-rose-300"
                style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-1 w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #00ffc8 0%, #00b4d8 100%)",
                color: "#020c18",
                boxShadow: loading ? "none" : "0 0 25px rgba(0,255,200,0.28)",
              }}
            >
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
                    Đang tạo tài khoản...
                  </>
                ) : (
                  <>Tạo Tài Khoản <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></>
                )}
              </span>
            </button>
          </form>

          {/* Footer links – mũi tên ngược chiều (register → login = slide phải) */}
          <div className="mt-6 flex items-center justify-center gap-1 text-xs text-slate-500">
            Đã có tài khoản?
            <Link
              href="/login"
              className="group ml-1 inline-flex items-center gap-1 font-bold text-[#00ffc8] transition-all hover:gap-2 hover:opacity-90"
            >
              <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 8H3M7 12l-4-4 4-4" />
              </svg>
              Đăng nhập
            </Link>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            <Link href="/" className="transition hover:text-slate-400">← Về trang chủ</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobA {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.08); }
        }
        @keyframes blobB {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(25px, -25px) scale(1.06); }
        }
        @keyframes starT {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
