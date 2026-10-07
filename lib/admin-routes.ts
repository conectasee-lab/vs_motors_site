/**
 * Screens that render the AdminSidebar: /admin/* plus the /estoque create/edit
 * screens (see app/estoque/novo/layout.tsx).
 */
export function isAdminScreen(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname === "/estoque/novo" ||
    /^\/estoque\/[^/]+\/editar$/.test(pathname)
  );
}
