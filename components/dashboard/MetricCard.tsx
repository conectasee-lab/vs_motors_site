import type { ReactNode } from "react";

const ACCENT_CLASSES: Record<"red" | "green" | "black", string> = {
  red: "bg-brand-red/10 text-brand-red",
  green: "bg-green-100 text-green-700",
  black: "bg-brand-black/10 text-brand-black",
};

export default function MetricCard({
  label,
  value,
  accentColor,
  icon,
}: {
  label: string;
  value: string;
  accentColor: "red" | "green" | "black";
  icon: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ACCENT_CLASSES[accentColor]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-brand-black">{value}</p>
      </div>
    </div>
  );
}
