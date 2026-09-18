"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 flex items-center justify-center rounded-lg bg-brand-black text-white shadow-md"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`w-64 shrink-0 bg-brand-black border-r border-brand-gold/20 min-h-screen flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
    </>
  );
}
