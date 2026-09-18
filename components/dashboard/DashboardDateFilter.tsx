"use client";

import { useRouter } from "next/navigation";

function firstDayOfCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function DashboardDateFilter({ initialAte }: { initialAte: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
      Vendas até
      <input
        type="date"
        defaultValue={initialAte}
        min={firstDayOfCurrentMonth()}
        onChange={(e) => {
          if (!e.target.value) return;
          router.push(`/admin/dashboard?ate=${e.target.value}`);
        }}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-brand-black"
      />
    </label>
  );
}
