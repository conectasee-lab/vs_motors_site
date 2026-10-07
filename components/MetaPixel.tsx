"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAdminScreen } from "@/lib/admin-routes";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Meta's base snippet: queues fbq() calls until fbevents.js loads, then inits the pixel once. */
function ensurePixel(pixelId: string) {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", pixelId);
}

/** Sends a standard Meta Pixel event (e.g. "Contact", "Lead"); no-op when the pixel isn't loaded. */
export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  window.fbq?.("track", event, params);
}

/**
 * Loads the Meta Pixel on public pages and sends a PageView on every client-side
 * navigation (the App Router doesn't reload the page, so the snippet alone would
 * only count the first view). Admin and login screens are not tracked.
 */
export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID || isAdminScreen(pathname) || pathname === "/login") return;
    ensurePixel(PIXEL_ID);
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
