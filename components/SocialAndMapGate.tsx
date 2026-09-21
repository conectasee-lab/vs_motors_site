"use client";

import { usePathname } from "next/navigation";

/** The contact page carries its own map and social links, so the shared block is hidden there. */
export default function SocialAndMapGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/contato") return null;
  return <>{children}</>;
}
