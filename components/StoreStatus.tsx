"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, HOURS_ROWS, type StoreStatus as Status } from "@/lib/store-hours";

function useStoreStatus(): Status | null {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getStoreStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/** Live open/closed indicator, meant for dark backgrounds. Renders nothing until mounted to avoid hydration mismatch. */
export function StoreStatusBadge() {
  const status = useStoreStatus();
  return (
    <p className="flex items-center gap-3 text-lg font-semibold text-white min-h-7" role="status">
      {status && (
        <>
          <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
            {status.open && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-60 motion-safe:animate-ping" />
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${status.open ? "bg-brand-red" : "bg-gray-500"}`}
            />
          </span>
          {status.message}
        </>
      )}
    </p>
  );
}

/** Weekly hours with today's row emphasised once the client knows the current weekday. */
export function StoreHoursList() {
  const status = useStoreStatus();
  return (
    <dl className="space-y-2">
      {HOURS_ROWS.map((row) => {
        const isToday = status !== null && row.days.includes(status.day);
        return (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className={isToday ? "font-bold text-brand-black" : "text-gray-600"}>
              {row.label}
              {isToday && <span className="sr-only"> (hoje)</span>}
            </dt>
            <dd className={`tabular-nums ${isToday ? "font-bold text-brand-black" : "text-gray-600"}`}>{row.text}</dd>
          </div>
        );
      })}
    </dl>
  );
}
