"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/estoque?q=${encodeURIComponent(trimmed)}` : "/estoque");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar marca ou modelo — ex: Corolla, Onix"
        className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
      />
      <button
        type="submit"
        className="bg-brand-red hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center"
      >
        Buscar veículo
      </button>
    </form>
  );
}
