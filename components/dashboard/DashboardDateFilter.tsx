"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardDateFilter({
  initialDe,
  initialAte,
}: {
  initialDe: string;
  initialAte: string;
}) {
  const router = useRouter();
  const [de, setDe] = useState(initialDe);
  const [ate, setAte] = useState(initialAte);

  function push(nextDe: string, nextAte: string) {
    if (!nextDe || !nextAte) return;
    router.push(`/admin/dashboard?de=${nextDe}&ate=${nextAte}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex flex-col gap-1 text-xs text-white/60">
        Inicial
        <input
          type="date"
          value={de}
          max={ate}
          onChange={(e) => {
            setDe(e.target.value);
            push(e.target.value, ate);
          }}
          className="rounded-full px-3 py-1.5 text-xs text-dash-ink bg-white/90"
        />
      </label>
      <span className="text-white/30 mt-4">–</span>
      <label className="flex flex-col gap-1 text-xs text-white/60">
        Final
        <input
          type="date"
          value={ate}
          min={de}
          onChange={(e) => {
            setAte(e.target.value);
            push(de, e.target.value);
          }}
          className="rounded-full px-3 py-1.5 text-xs text-dash-ink bg-white/90"
        />
      </label>
    </div>
  );
}
