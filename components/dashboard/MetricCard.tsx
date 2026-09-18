import type { ReactNode } from "react";

type Accent = "red" | "blue" | "slate";

const CHIP_BG: Record<Accent, string> = {
  red: "bg-dash-chip-red text-brand-red",
  blue: "bg-dash-chip-blue text-indigo-600",
  slate: "bg-dash-chip-slate text-dash-ink",
};

const CHIP_BG_DARK: Record<Accent, string> = {
  red: "bg-brand-red/20 text-brand-red",
  blue: "bg-white/10 text-white",
  slate: "bg-white/10 text-white",
};

export default function MetricCard({
  label,
  value,
  caption,
  accent,
  icon,
  variant = "light",
}: {
  label: string;
  value: string;
  caption?: string;
  accent: Accent;
  icon: ReactNode;
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";

  return (
    <div
      className={`rounded-[20px] p-6 shadow-[0_8px_24px_-12px_rgba(27,35,64,0.18)] ${
        dark ? "bg-dash-navy" : "bg-dash-panel"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 ${
          dark ? CHIP_BG_DARK[accent] : CHIP_BG[accent]
        }`}
      >
        {icon}
      </div>
      <p className={`text-sm mb-1 ${dark ? "text-white/60" : "text-dash-muted"}`}>{label}</p>
      <p
        className={`text-3xl font-semibold tabular-nums ${dark ? "text-white" : "text-dash-ink"}`}
        style={{ fontFamily: "var(--font-dash-numeric)" }}
      >
        {value}
      </p>
      {caption ? (
        <p className={`text-xs mt-2 ${dark ? "text-white/50" : "text-dash-muted"}`}>{caption}</p>
      ) : null}
    </div>
  );
}
