"use client";

import { usePathname } from "next/navigation";
import { isAdminScreen } from "@/lib/admin-routes";

/**
 * Admin screens render the fixed AdminSidebar and don't need the public footer.
 * The public /estoque listing and vehicle detail pages keep the footer.
 */
export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAdminScreen(pathname)) return null;
  return <>{children}</>;
}
