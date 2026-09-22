"use client";

import { usePathname } from "next/navigation";

/**
 * The contact page carries its own map and social links, so the shared block is hidden there.
 * Admin screens (which render the fixed AdminSidebar) also hide it, since the sidebar
 * overlaps this block instead of sharing layout space with it.
 */
export default function SocialAndMapGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/contato") return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/estoque")) return null;
  return <>{children}</>;
}
