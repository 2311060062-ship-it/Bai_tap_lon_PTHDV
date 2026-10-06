/**
 * Logo.tsx – Hệ thống logo CarRental (thuần SVG, không cần file ảnh)
 *
 * Exports:
 *  - <CarIcon />          — Chỉ icon xe sedan + speed lines (dùng cho badge tròn)
 *  - <LogoCombination />  — Icon + Wordmark ngang (Navbar, sidebar)
 *  - <LogoBadge />        — Icon trong hình tròn/vuông có gradient (login page)
 *  - <AdminShieldIcon />  — Shield amber (admin login)
 */

/* ─────────────────────────────────────────────────────────────────────────────
   1. CAR ICON SVG  – sedan side-view + speed lines, teal gradient
   ───────────────────────────────────────────────────────────────────────────── */
export function CarIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const id = "carGrad_logo";
  return (
    <svg
      width={size}
      height={(size * 28) / 48}
      viewBox="0 0 48 28"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00ffc8" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>
      </defs>

      {/* Speed lines (left/rear) */}
      <line x1="0"  y1="17" x2="12" y2="17" stroke="#00ffc8" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.55" />
      <line x1="2"  y1="20.5" x2="10" y2="20.5" stroke="#00ffc8" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.35" />
      <line x1="4"  y1="24" x2="9"  y2="24"  stroke="#00ffc8" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.2"  />

      {/* Car lower body */}
      <path
        d="M10 21 L15 10 Q17 7 20 7 L34 7 Q37 7 39 10 L44 21 Z"
        fill={`url(#${id})`}
      />
      {/* Roof / cabin */}
      <path
        d="M17 21 L20 10 L32 10 L37 21 Z"
        fill="#00ffc8"
        fillOpacity="0.75"
      />
      {/* Windshield highlight */}
      <path
        d="M34 21 L37 12 L36 10 L33 11 L32 21 Z"
        fill="rgba(255,255,255,0.18)"
      />

      {/* Front wheel */}
      <circle cx="37" cy="22" r="4.5" fill={`url(#${id})`} />
      <circle cx="37" cy="22" r="2.5" fill="#0a1628" />
      <circle cx="37" cy="22" r="1"   fill="#00ffc8" fillOpacity="0.6" />

      {/* Rear wheel */}
      <circle cx="16" cy="22" r="4.5" fill={`url(#${id})`} />
      <circle cx="16" cy="22" r="2.5" fill="#0a1628" />
      <circle cx="16" cy="22" r="1"   fill="#00ffc8" fillOpacity="0.6" />

      {/* Ground line */}
      <line x1="8" y1="26.5" x2="48" y2="26.5" stroke="#00ffc8" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. COMBINATION MARK  – icon + wordmark (horizontal)
   ───────────────────────────────────────────────────────────────────────────── */
interface LogoCombinationProps {
  /** "full" = icon + 2-line wordmark | "inline" = icon + single-line wordmark */
  variant?: "full" | "inline";
  iconSize?: number;
  showTagline?: boolean;
  className?: string;
}

export function LogoCombination({
  variant = "inline",
  iconSize = 36,
  showTagline = false,
  className = "",
}: LogoCombinationProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon with subtle glow wrapper */}
      <div className="relative shrink-0">
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: "rgba(0,255,200,0.15)",
            filter: "blur(8px)",
            transform: "scale(1.3)",
          }}
        />
        <CarIcon size={iconSize} />
      </div>

      {/* Wordmark */}
      {variant === "inline" ? (
        <div className="flex flex-col leading-none">
          <span className="font-black tracking-tight" style={{ fontSize: iconSize * 0.5, lineHeight: 1.1 }}>
            <span style={{ color: "#00ffc8" }}>Car</span>
            <span className="text-white">Rental</span>
          </span>
          {showTagline && (
            <span className="mt-0.5 font-medium text-slate-400" style={{ fontSize: iconSize * 0.25, letterSpacing: "0.04em" }}>
              Premium Drive Experience
            </span>
          )}
        </div>
      ) : (
        <div className="leading-none">
          <div className="font-black tracking-tight" style={{ fontSize: iconSize * 0.55 }}>
            <span style={{ color: "#00ffc8" }}>Car</span>
            <span className="text-white">Rental</span>
          </div>
          <div className="font-semibold text-slate-400" style={{ fontSize: iconSize * 0.28, letterSpacing: "0.06em" }}>
            {showTagline ? "Premium Drive Experience" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. LOGO BADGE  – icon trong ô vuông bo tròn gradient (dùng cho login page)
   ───────────────────────────────────────────────────────────────────────────── */
export function LogoBadge({
  size = 56,
  glow = true,
}: {
  size?: number;
  glow?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #00ffc8 0%, #00b4d8 100%)",
        boxShadow: glow ? "0 0 28px rgba(0,255,200,0.35)" : undefined,
      }}
    >
      <CarIcon size={Math.round(size * 0.62)} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. ADMIN COMBINATION – icon + "Admin Portal" wordmark (sidebar)
   ───────────────────────────────────────────────────────────────────────────── */
export function AdminLogoCombination({ iconSize = 36 }: { iconSize?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex shrink-0 items-center justify-center rounded-xl"
        style={{
          width: iconSize,
          height: iconSize,
          background: "linear-gradient(135deg, #00ffc8, #00b4d8)",
          boxShadow: "0 0 16px rgba(0,255,200,0.3)",
        }}
      >
        <CarIcon size={Math.round(iconSize * 0.72)} />
      </div>
      <div className="leading-none">
        <p
          className="font-extrabold text-white"
          style={{ fontSize: iconSize * 0.38 }}
        >
          Admin Portal
        </p>
        <p
          className="mt-0.5 font-semibold"
          style={{ fontSize: iconSize * 0.27, color: "rgba(0,255,200,0.7)" }}
        >
          CarRental System
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. ADMIN SHIELD ICON  – amber hexagonal shield (admin login page)
   ───────────────────────────────────────────────────────────────────────────── */
export function AdminShieldBadge({ size = 56 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        boxShadow: "0 0 28px rgba(245,158,11,0.35)",
      }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 32 36"
        fill="none"
        aria-hidden
      >
        {/* Shield shape */}
        <path
          d="M16 1 L30 7 L30 20 Q30 30 16 35 Q2 30 2 20 L2 7 Z"
          fill="rgba(2,12,24,0.3)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        {/* Lock shackle */}
        <path
          d="M11 17 L11 12 Q11 7 16 7 Q21 7 21 12 L21 17"
          fill="none"
          stroke="#020c18"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Lock body */}
        <rect x="9" y="17" width="14" height="11" rx="3" fill="#020c18" fillOpacity="0.85" />
        {/* Keyhole */}
        <circle cx="16" cy="21.5" r="2" fill="rgba(245,158,11,0.9)" />
        <rect x="15" y="22" width="2" height="3" rx="0.5" fill="rgba(245,158,11,0.9)" />
      </svg>
    </div>
  );
}
