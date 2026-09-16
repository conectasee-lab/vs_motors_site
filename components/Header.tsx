"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/estoque", label: "Estoque" },
  { href: "/sobre", label: "Sobre" },
  { href: "/venda-seu-carro", label: "Venda seu Carro" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-brand-black border-b border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="VS Motors" width={160} height={45} />
        </Link>

        <nav className="hidden md:flex gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                pathname === item.href
                  ? "text-brand-red border-brand-red"
                  : "text-white border-transparent hover:text-brand-red"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden flex flex-col gap-1.5 w-7"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          <span className={`h-0.5 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col bg-brand-black px-4 pb-4 border-t border-gray-800">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`py-3 text-sm font-medium transition-colors hover:text-brand-red ${
                pathname === item.href ? "text-brand-red" : "text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
