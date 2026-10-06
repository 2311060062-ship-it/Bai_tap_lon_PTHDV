"use client";

import { FormEvent, KeyboardEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { LogoCombination } from "@/components/Logo";

const OTP_LENGTH = 6;
const OTP_SECONDS = 120;

function maskEmail(email: string) {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed ? `***${trimmed}` : "";
  return `***${trimmed.slice(at > 3 ? 3 : 0)}`;
}

function OtpShieldArt() {
  return (
    <svg viewBox="0 0 180 150" className="mx-auto h-[132px] w-[160px]" aria-hidden>
      <defs>
        <linearGradient id="otpShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00ffc8" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>
        <linearGradient id="otpGear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="78" rx="62" ry="48" fill="rgba(0,255,200,0.08)" />
      <g transform="translate(28 28)" fill="none" stroke="url(#otpGear)" strokeWidth="3.2">
        <circle cx="16" cy="16" r="7" />
        <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8" strokeLinecap="round" />
      </g>
      <g transform="translate(124 86)" fill="none" stroke="#67e8f9" strokeWidth="2.6" opacity="0.75">
        <circle cx="12" cy="12" r="5.5" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" strokeLinecap="round" />
      </g>
      <path
        d="M90 28 L128 42 L128 78 Q128 108 90 122 Q52 108 52 78 L52 42 Z"
        fill="rgba(0,180,216,0.16)"
        stroke="url(#otpShield)"
        strokeWidth="3"
      />
      <path
        d="M78 76 V66 Q78 54 90 54 Q102 54 102 66 V76"
        fill="none"
        stroke="#00ffc8"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="74" y="74" width="32" height="24" rx="6" fill="#00ffc8" />
      <circle cx="90" cy="84" r="3.2" fill="#041428" />
      <rect x="88.4" y="84" width="3.2" height="6" rx="1" fill="#041428" />
      <rect x="78" y="132" width="24" height="5" rx="2.5" fill="#00ffc8" opacity="0.85" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={68 + i * 11} cy="124" r="2.2" fill="#00ffc8" opacity={0.35 + i * 0.12} />
      ))}
    </svg>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-slate-400">Đang tải...</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email] = useState(searchParams.get("email") || "");
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const otp = digits.join("");
  const masked = maskEmail(email);

  const fillDigits = (value: string, start = 0) => {
    const chars = value.replace(/\D/g, "").slice(0, OTP_LENGTH - start).split("");
    let joined = "";
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((char, offset) => {
        next[start + offset] = char;
      });
      joined = next.join("");
      return next;
    });
    const focusAt = Math.min(start + chars.length, OTP_LENGTH - 1);
    inputsRef.current[focusAt]?.focus();
    return joined;
  };

  const verifyOtp = async (code: string) => {
    if (!email.trim()) {
      setError("Thiếu email đăng ký. Hãy đăng ký lại hoặc gửi lại mã.");
      return;
    }
    if (code.length !== OTP_LENGTH) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }
    setError("");
    setMessage("");
    setVerifying(true);
    try {
      const res = await api.post("/api/auth/verify-email", { email: email.trim(), otp: code });
      setMessage(res.data?.message || "Xác thực thành công.");
      window.setTimeout(() => router.push("/login"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã OTP không đúng");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await verifyOtp(otp);
  };

  const onChangeDigit = (index: number, value: string) => {
    if (value.length > 1) {
      fillDigits(value, index);
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const resend = async () => {
    if (secondsLeft > 0 || sending) return;
    if (!email.trim()) {
      setError("Thiếu email đăng ký. Hãy đăng ký lại.");
      return;
    }
    setSending(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/api/auth/resend-verification", { email: email.trim() });
      setMessage(res.data?.message || "Đã gửi lại mã OTP.");
      setDigits(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(OTP_SECONDS);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi lại được OTP");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-stretch overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020c18 0%, #041428 50%, #020c18 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,200,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <aside
        className="hidden w-[88px] shrink-0 sm:block lg:w-[140px]"
        style={{ background: "linear-gradient(180deg, rgba(0,180,216,0.22) 0%, rgba(0,255,200,0.08) 100%)" }}
      />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-[460px] rounded-3xl px-6 py-9 sm:px-10"
          style={{
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            animation: "cardIn 0.65s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div className="mb-4 flex justify-center">
            <LogoCombination iconSize={32} />
          </div>

          <OtpShieldArt />

          <h1 className="mt-2 text-center text-xl font-extrabold tracking-wide text-white sm:text-2xl">
            XÁC THỰC OTP
          </h1>
          <p className="mx-auto mt-2 max-w-[360px] text-center text-sm leading-6 text-slate-300">
            Vui lòng nhập mã số chúng tôi đã gửi cho bạn qua email{" "}
            <span className="font-semibold text-cyan-300">{masked || "đăng ký"}</span>.
            Mã xác thực có giá trị trong{" "}
            <span className={secondsLeft > 0 ? "font-bold text-[#00ffc8]" : "font-bold text-rose-400"}>
              {secondsLeft}s
            </span>
          </p>

          <form onSubmit={submit} className="mt-7">
            <div className="flex justify-center gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  value={digit}
                  onChange={(event) => onChangeDigit(index, event.target.value)}
                  onKeyDown={(event) => onKeyDown(index, event)}
                  onPaste={(event) => {
                    event.preventDefault();
                    fillDigits(event.clipboardData.getData("text"));
                  }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  data-otp-index={index}
                  className="h-12 w-10 rounded-xl text-center text-lg font-bold text-white outline-none transition sm:h-14 sm:w-12 sm:text-xl"
                  style={{
                    background: "rgba(8, 24, 42, 0.9)",
                    border: digit
                      ? "1.5px solid rgba(0,255,200,0.85)"
                      : "1.5px solid rgba(148, 226, 213, 0.35)",
                    boxShadow: digit ? "0 0 0 3px rgba(0,255,200,0.12)" : "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-rose-400">{error}</p>
            )}
            {message && (
              <p className="mt-4 text-center text-sm text-emerald-400">{message}</p>
            )}

            <button
              type="submit"
              disabled={verifying || otp.length !== OTP_LENGTH}
              className="mt-6 w-full rounded-full py-3.5 text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #00ffc8 0%, #00b4d8 100%)",
                color: "#020c18",
                boxShadow: verifying ? "none" : "0 0 25px rgba(0,255,200,0.28)",
              }}
            >
              {verifying ? "Đang xác thực..." : "Tiếp tục"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Chưa nhận được mã?{" "}
            {secondsLeft > 0 ? (
              <span className="font-semibold text-slate-500">Gửi lại sau {secondsLeft}s</span>
            ) : (
              <button
                type="button"
                onClick={resend}
                disabled={sending}
                className="font-semibold text-[#00ffc8] hover:underline disabled:opacity-60"
              >
                {sending ? "Đang gửi lại..." : "Gửi lại"}
              </button>
            )}
          </p>

          <p className="mt-6 text-center text-sm text-slate-500">
            Đã xác thực?{" "}
            <Link href="/login" className="font-semibold text-cyan-300 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      <aside
        className="hidden w-[88px] shrink-0 sm:block lg:w-[140px]"
        style={{ background: "linear-gradient(180deg, rgba(0,180,216,0.22) 0%, rgba(0,255,200,0.08) 100%)" }}
      />

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
