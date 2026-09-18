"use client";

import { useRouter } from "next/navigation";

export default function DashboardDateFilter({ initialAte }: { initialAte: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
      Vendas até
      <input
        type="date"
        defaultValue={initialAte}
        onChange={(e) => router.push(`/admin/dashboard?ate=${e.target.value}`)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-brand-black"
      />
    </label>
  );
}
