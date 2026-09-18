"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";

const NAV_ITEMS = [
  { href: "/estoque", label: "Estoque", exact: true },
  { href: "/estoque/novo", label: "Cadastrar veículo", exact: true },
  { href: "/admin/dashboard", label: "Dashboard", exact: false },
  { href: "/admin/usuarios", label: "Gerenciar usuários", exact: false },
  { href: "/admin/marcas", label: "Gerenciar marcas", exact: false },
  { href: "/admin/contato", label: "Gerenciar contato", exact: false },
  { href: "/admin/acessorios", label: "Gerenciar acessórios", exact: false },
  { href: "/admin/carrocerias", label: "Gerenciar carrocerias", exact: false },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-brand-black border-r border-brand-gold/20 min-h-screen flex flex-col">
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold px-4 py-2.5 rounded transition-colors ${
                isActive
                  ? "bg-brand-gold text-brand-black"
                  : "text-white border border-transparent hover:border-brand-gold/40"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="px-4 py-6 border-t border-brand-gold/20">
        <button type="submit" className="text-sm font-semibold text-brand-red hover:underline">
          Sair
        </button>
      </form>
    </aside>
  );
}
