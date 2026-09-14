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
    <header className="bg-brand-black border-b border-brand-gold/30 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VS Motors" width={44} height={44} />
          <span className="text-brand-red font-bold text-lg">VS MOTORS</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                pathname === item.href
                  ? "text-white border-brand-red"
                  : "text-gray-300 border-transparent hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col bg-brand-black-soft px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`py-2 text-sm ${
                pathname === item.href ? "text-brand-red" : "text-gray-300"
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
