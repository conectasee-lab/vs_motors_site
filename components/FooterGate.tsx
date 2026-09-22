"use client";

import { usePathname } from "next/navigation";

/**
 * Admin screens render the fixed AdminSidebar and don't need the public footer.
 * This covers /admin/* plus the /estoque create/edit screens, which also render
 * the AdminSidebar (see app/estoque/novo/layout.tsx). The public /estoque listing
 * and vehicle detail pages keep the footer.
 */
export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminEstoqueScreen =
    pathname === "/estoque/novo" || /^\/estoque\/[^/]+\/editar$/.test(pathname);
  if (pathname.startsWith("/admin") || isAdminEstoqueScreen) return null;
  return <>{children}</>;
}
