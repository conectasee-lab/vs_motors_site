type Accent = "red" | "steel" | "muted";

const QUIET_BAR_CLASSES: Record<Accent, string> = {
  red: "bg-brand-red",
  steel: "bg-dash-steel",
  muted: "bg-dash-muted",
};

const QUIET_VALUE_CLASSES: Record<Accent, string> = {
  red: "text-brand-red",
  steel: "text-dash-steel",
  muted: "text-dash-ink",
};

export default function MetricCard({
  label,
  value,
  caption,
  accent,
  variant = "quiet",
}: {
  label: string;
  value: string;
  caption?: string;
  accent: Accent;
  variant?: "hero" | "quiet";
}) {
  if (variant === "hero") {
    return (
      <div className="bg-dash-steel rounded-sm p-6 sm:p-8 flex flex-col gap-1">
        <p className="text-sm text-white/60">{label}</p>
        <p
          className="text-4xl sm:text-5xl font-medium text-brand-red tabular-nums"
          style={{ fontFamily: "var(--font-dash-numeric)" }}
        >
          {value}
        </p>
        {caption ? <p className="text-sm text-white/70 mt-1">{caption}</p> : null}
      </div>
    );
  }

  return (
    <div className="bg-dash-panel border border-dash-line rounded-sm pl-4 pr-6 py-5 flex items-stretch gap-4">
      <div className={`w-1 rounded-full ${QUIET_BAR_CLASSES[accent]}`} />
      <div>
        <p className="text-sm text-dash-muted">{label}</p>
        <p
          className={`text-3xl font-medium tabular-nums ${QUIET_VALUE_CLASSES[accent]}`}
          style={{ fontFamily: "var(--font-dash-numeric)" }}
        >
          {value}
        </p>
        {caption ? <p className="text-sm text-dash-muted mt-1">{caption}</p> : null}
      </div>
    </div>
  );
}
