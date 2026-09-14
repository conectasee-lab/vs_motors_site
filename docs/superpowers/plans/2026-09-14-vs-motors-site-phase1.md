# VS Motors Site — Fase 1 (Navegação + Telas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing VS Motors website (Home, Estoque, vehicle
detail, Sobre, Venda seu Carro, Contato) as a navigable Next.js app styled
with the brand's black/red/gold identity, populated with mock vehicle data —
no backend, no auth, no database.

**Architecture:** Single Next.js (App Router, TypeScript) app. Shared
`Header`/`Footer` in the root layout. Mock vehicle data lives in one typed
module (`lib/vehicles.ts`) shaped so it maps 1:1 onto the future Supabase
schema. Estoque filtering runs client-side over the mock array via a pure,
independently testable filter function. Styling via Tailwind CSS using a
custom theme (brand colors as Tailwind tokens).

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Vitest +
React Testing Library (for the one piece of real logic: stock filtering).

**Spec:** [docs/superpowers/specs/2026-09-14-vs-motors-site-design.md](../specs/2026-09-14-vs-motors-site-design.md)

## Global Constraints

- Dark theme: background `#0a0a0a`/`#121212`, primary accent red `#c8102e`,
  secondary accent gold `#d4af37`, body text white/light gray.
- WhatsApp CTA button keeps WhatsApp's standard green (`#25D366`) — the one
  deliberate exception to the palette.
- No backend/DB/auth in this phase. All vehicle data comes from
  `lib/vehicles.ts`. The "Venda seu Carro" form has no submit handler wired
  to a server in this phase (UI only).
- Vehicle data fields must be: `id, brand, model, year, price, km,
  transmission ('manual'|'automatic'), fuel, color, images (string[]),
  description` — this exact shape is what the future Supabase table will
  mirror, so don't rename or drop fields later without updating both.
- Header nav items, in order: Estoque, Sobre, Venda seu Carro, Contato.
  Active item underlined in red.

---

## File Structure

- `app/layout.tsx` — root layout, wraps every page with `Header` + `Footer`, loads Tailwind globals and fonts.
- `app/globals.css` — Tailwind base + brand CSS variables.
- `tailwind.config.ts` — brand color tokens (`brand.black`, `brand.red`, `brand.gold`).
- `components/Header.tsx` — logo + nav + mobile drawer.
- `components/Footer.tsx` — contact info, social links, address.
- `components/VehicleCard.tsx` — card used in Home highlights and Estoque grid.
- `components/WhatsAppButton.tsx` — reusable button that builds a `wa.me` link with a prefilled message.
- `lib/vehicles.ts` — `Vehicle` type + mock data array + `filterVehicles()` pure function.
- `lib/vehicles.test.ts` — unit tests for `filterVehicles()`.
- `app/page.tsx` — Home.
- `app/estoque/page.tsx` — Estoque listing + filters (client component).
- `app/estoque/[id]/page.tsx` — vehicle detail page.
- `app/sobre/page.tsx` — Sobre (static content).
- `app/venda-seu-carro/page.tsx` — sell-your-car form (UI only, client component for form state).
- `app/contato/page.tsx` — Contato.
- `public/logo.png` — brand logo asset (placeholder until user supplies final file).

---

## Task 1: Project scaffold + brand theme

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (temporary placeholder content)
- Create: `public/logo.png` (placeholder file — see Step 6)

**Interfaces:**
- Produces: Tailwind tokens `brand.black` (`#0a0a0a`), `brand.blackSoft` (`#121212`), `brand.red` (`#c8102e`), `brand.gold` (`#d4af37`), `brand.whatsapp` (`#25D366`) — every later task styles with these tokens, never raw hex.

- [ ] **Step 1: Scaffold the Next.js app**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```
When prompted, accept defaults. This creates `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`.

- [ ] **Step 2: Verify the scaffold runs**

Run: `npm run dev` (then stop it with Ctrl+C once you see "Ready" in the output — this is just a sanity check, not a persistent process for this task).
Expected: dev server starts with no errors, default Next.js welcome page compiles.

- [ ] **Step 3: Add brand color tokens to Tailwind config**

Edit `tailwind.config.ts`, add to `theme.extend.colors`:

```ts
colors: {
  brand: {
    black: "#0a0a0a",
    blackSoft: "#121212",
    red: "#c8102e",
    gold: "#d4af37",
    whatsapp: "#25D366",
  },
},
```

- [ ] **Step 4: Set global dark background and default text color**

Edit `app/globals.css`, inside the `body` selector (or add one if the scaffold didn't create it), add:

```css
body {
  background-color: #0a0a0a;
  color: #f5f5f5;
}
```

- [ ] **Step 5: Verify the theme compiles**

Run: `npm run build`
Expected: build succeeds with no TypeScript/Tailwind errors.

- [ ] **Step 6: Add placeholder logo asset**

Create `public/logo.png` — if you have the actual VS Motors logo file, save it here. Otherwise create a simple placeholder: any square PNG with a black background and the text "VS MOTORS" is sufficient for now; note in the commit message that it's a placeholder to be swapped with the real asset.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with brand color theme"
```

---

## Task 2: Mock vehicle data + filter logic (TDD)

**Files:**
- Create: `lib/vehicles.ts`
- Test: `lib/vehicles.test.ts`

**Interfaces:**
- Consumes: nothing (no dependency on other tasks).
- Produces: `type Vehicle = { id: string; brand: string; model: string; year: number; price: number; km: number; transmission: 'manual' | 'automatic'; fuel: string; color: string; images: string[]; description: string }`, `const vehicles: Vehicle[]`, `type VehicleFilters = { brand?: string; model?: string; minYear?: number; maxYear?: number; minPrice?: number; maxPrice?: number; maxKm?: number; transmission?: 'manual' | 'automatic'; fuel?: string; color?: string }`, `function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[]`. Task 5 (Estoque page) and Task 6 (detail page) both import `vehicles`, `Vehicle`, `filterVehicles` from `@/lib/vehicles`.

- [ ] **Step 1: Install test dependencies**

Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`

- [ ] **Step 2: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Add to `package.json` `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 3: Write the failing test for filterVehicles**

Create `lib/vehicles.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { filterVehicles, type Vehicle } from "./vehicles";

const sample: Vehicle[] = [
  {
    id: "1", brand: "Toyota", model: "Corolla", year: 2020, price: 90000,
    km: 40000, transmission: "automatic", fuel: "Flex", color: "Prata",
    images: [], description: "",
  },
  {
    id: "2", brand: "Honda", model: "Civic", year: 2018, price: 75000,
    km: 60000, transmission: "manual", fuel: "Flex", color: "Preto",
    images: [], description: "",
  },
  {
    id: "3", brand: "Toyota", model: "Hilux", year: 2022, price: 220000,
    km: 15000, transmission: "automatic", fuel: "Diesel", color: "Branco",
    images: [], description: "",
  },
];

describe("filterVehicles", () => {
  it("returns all vehicles when no filters are given", () => {
    expect(filterVehicles(sample, {})).toHaveLength(3);
  });

  it("filters by brand", () => {
    const result = filterVehicles(sample, { brand: "Toyota" });
    expect(result.map((v) => v.id)).toEqual(["1", "3"]);
  });

  it("filters by price range", () => {
    const result = filterVehicles(sample, { minPrice: 80000, maxPrice: 100000 });
    expect(result.map((v) => v.id)).toEqual(["1"]);
  });

  it("filters by max km", () => {
    const result = filterVehicles(sample, { maxKm: 50000 });
    expect(result.map((v) => v.id)).toEqual(["1", "3"]);
  });

  it("filters by transmission", () => {
    const result = filterVehicles(sample, { transmission: "manual" });
    expect(result.map((v) => v.id)).toEqual(["2"]);
  });

  it("combines multiple filters", () => {
    const result = filterVehicles(sample, { brand: "Toyota", transmission: "automatic", minYear: 2021 });
    expect(result.map((v) => v.id)).toEqual(["3"]);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `./vehicles` module not found (file doesn't exist yet).

- [ ] **Step 5: Implement vehicles.ts with mock data and filterVehicles**

Create `lib/vehicles.ts`:

```ts
export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: "manual" | "automatic";
  fuel: string;
  color: string;
  images: string[];
  description: string;
};

export type VehicleFilters = {
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxKm?: number;
  transmission?: "manual" | "automatic";
  fuel?: string;
  color?: string;
};

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  return vehicles.filter((v) => {
    if (filters.brand && v.brand !== filters.brand) return false;
    if (filters.model && v.model !== filters.model) return false;
    if (filters.minYear && v.year < filters.minYear) return false;
    if (filters.maxYear && v.year > filters.maxYear) return false;
    if (filters.minPrice && v.price < filters.minPrice) return false;
    if (filters.maxPrice && v.price > filters.maxPrice) return false;
    if (filters.maxKm && v.km > filters.maxKm) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.fuel && v.fuel !== filters.fuel) return false;
    if (filters.color && v.color !== filters.color) return false;
    return true;
  });
}

export const vehicles: Vehicle[] = [
  {
    id: "1", brand: "Toyota", model: "Corolla", year: 2021, price: 112000,
    km: 32000, transmission: "automatic", fuel: "Flex", color: "Prata",
    images: ["/vehicles/placeholder-1.jpg"],
    description: "Toyota Corolla completo, único dono, revisado.",
  },
  {
    id: "2", brand: "Honda", model: "Civic", year: 2019, price: 98000,
    km: 55000, transmission: "automatic", fuel: "Flex", color: "Preto",
    images: ["/vehicles/placeholder-2.jpg"],
    description: "Honda Civic EXL, teto solar, bancos em couro.",
  },
  {
    id: "3", brand: "Jeep", model: "Compass", year: 2022, price: 165000,
    km: 18000, transmission: "automatic", fuel: "Flex", color: "Branco",
    images: ["/vehicles/placeholder-3.jpg"],
    description: "Jeep Compass Longitude, seminovo, garantia de fábrica.",
  },
  {
    id: "4", brand: "Volkswagen", model: "Gol", year: 2017, price: 48000,
    km: 78000, transmission: "manual", fuel: "Flex", color: "Vermelho",
    images: ["/vehicles/placeholder-4.jpg"],
    description: "VW Gol 1.6, econômico, ideal para o dia a dia.",
  },
  {
    id: "5", brand: "Chevrolet", model: "Onix", year: 2020, price: 72000,
    km: 40000, transmission: "automatic", fuel: "Flex", color: "Cinza",
    images: ["/vehicles/placeholder-5.jpg"],
    description: "Chevrolet Onix LT, multimídia, baixo km.",
  },
  {
    id: "6", brand: "Toyota", model: "Hilux", year: 2023, price: 285000,
    km: 9000, transmission: "automatic", fuel: "Diesel", color: "Prata",
    images: ["/vehicles/placeholder-6.jpg"],
    description: "Toyota Hilux SRX 4x4, praticamente zero.",
  },
];
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all 6 tests green.

- [ ] **Step 7: Commit**

```bash
git add lib/vehicles.ts lib/vehicles.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add mock vehicle data and filterVehicles with tests"
```

---

## Task 3: Header and Footer components

**Files:**
- Create: `components/Header.tsx`
- Create: `components/Footer.tsx`
- Modify: `app/layout.tsx` (wrap children with `Header`/`Footer`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `<Header />` and `<Footer />` React components rendered in `app/layout.tsx`, available to every page implicitly (pages don't import them directly).

- [ ] **Step 1: Write Header component**

Create `components/Header.tsx`:

```tsx
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
        <nav className="md:hidden flex flex-col bg-brand-blackSoft px-4 pb-4">
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
```

- [ ] **Step 2: Write Footer component**

Create `components/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="bg-brand-blackSoft border-t border-brand-gold/30 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-3 text-sm text-gray-300">
        <div>
          <p className="text-brand-red font-bold mb-2">VS MOTORS</p>
          <p>Qualidade e confiança na hora de comprar seu carro.</p>
        </div>
        <div>
          <p className="text-brand-gold font-semibold mb-2">Contato</p>
          <p>Telefone: (00) 0000-0000</p>
          <p>WhatsApp: (00) 90000-0000</p>
          <p>contato@vsmotors.com.br</p>
        </div>
        <div>
          <p className="text-brand-gold font-semibold mb-2">Endereço</p>
          <p>Av. Exemplo, 1000 — Centro</p>
          <p>Cidade - UF, 00000-000</p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} VS Motors. Todos os direitos reservados.
      </p>
    </footer>
  );
}
```

- [ ] **Step 3: Wire Header/Footer into the root layout**

Edit `app/layout.tsx` — replace the body content with:

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ...keep existing metadata/font setup...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify it renders**

Run: `npm run dev`, open `http://localhost:3000` in a browser.
Expected: header with logo/nav and footer appear; nav links are clickable (pages behind them may still 404 until later tasks — that's expected).

- [ ] **Step 5: Commit**

```bash
git add components/Header.tsx components/Footer.tsx app/layout.tsx
git commit -m "feat: add Header and Footer with brand nav"
```

---

## Task 4: VehicleCard and WhatsAppButton components

**Files:**
- Create: `components/VehicleCard.tsx`
- Create: `components/WhatsAppButton.tsx`

**Interfaces:**
- Consumes: `Vehicle` type from `@/lib/vehicles` (Task 2).
- Produces: `<VehicleCard vehicle={Vehicle} />` (links to `/estoque/{id}`), `<WhatsAppButton vehicle={Vehicle} phoneNumber={string} />` — both consumed by Task 5 (Estoque page), Task 6 (detail page), and Task 7 (Home highlights).

- [ ] **Step 1: Write VehicleCard**

Create `components/VehicleCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      href={`/estoque/${vehicle.id}`}
      className="block bg-brand-blackSoft border border-brand-gold/20 rounded-lg overflow-hidden hover:border-brand-red transition-colors"
    >
      <div className="relative w-full h-48 bg-black">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="text-white font-semibold">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-gray-400 text-sm">
          {vehicle.year} · {vehicle.km.toLocaleString("pt-BR")} km
        </p>
        <p className="text-brand-red font-bold text-lg mt-2">
          {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Write WhatsAppButton**

Create `components/WhatsAppButton.tsx`:

```tsx
import type { Vehicle } from "@/lib/vehicles";

export default function WhatsAppButton({
  vehicle,
  phoneNumber = "5500000000000",
}: {
  vehicle: Vehicle;
  phoneNumber?: string;
}) {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} anunciado no site da VS Motors.`
  );
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-brand-whatsapp text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
    >
      Falar no WhatsApp
    </a>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds (components aren't wired into any page yet, but must type-check cleanly).

- [ ] **Step 4: Commit**

```bash
git add components/VehicleCard.tsx components/WhatsAppButton.tsx
git commit -m "feat: add VehicleCard and WhatsAppButton components"
```

---

## Task 5: Estoque page with filters

**Files:**
- Create: `app/estoque/page.tsx`

**Interfaces:**
- Consumes: `vehicles`, `filterVehicles`, `VehicleFilters` from `@/lib/vehicles` (Task 2); `VehicleCard` from `@/components/VehicleCard` (Task 4).
- Produces: page at `/estoque`. No exports consumed elsewhere.

- [ ] **Step 1: Write the Estoque page**

Create `app/estoque/page.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { vehicles, filterVehicles, type VehicleFilters } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";

const brands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
const fuels = Array.from(new Set(vehicles.map((v) => v.fuel))).sort();
const colors = Array.from(new Set(vehicles.map((v) => v.color))).sort();

export default function EstoquePage() {
  const [filters, setFilters] = useState<VehicleFilters>({});

  const results = useMemo(() => filterVehicles(vehicles, filters), [filters]);

  function update<K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value || undefined }));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Estoque</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-brand-blackSoft p-4 rounded-lg border border-brand-gold/20">
        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("brand", e.target.value)}
        >
          <option value="">Marca</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("transmission", e.target.value as "manual" | "automatic")}
        >
          <option value="">Câmbio</option>
          <option value="manual">Manual</option>
          <option value="automatic">Automático</option>
        </select>

        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("fuel", e.target.value)}
        >
          <option value="">Combustível</option>
          {fuels.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("color", e.target.value)}
        >
          <option value="">Cor</option>
          {colors.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Ano mínimo"
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("minYear", e.target.value ? Number(e.target.value) : undefined)}
        />
        <input
          type="number"
          placeholder="Preço máximo"
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
        />
        <input
          type="number"
          placeholder="KM máxima"
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("maxKm", e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      {results.length === 0 ? (
        <p className="text-gray-400">Nenhum veículo encontrado com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify manually**

Run: `npm run dev`, open `http://localhost:3000/estoque`.
Expected: grid of 6 mock vehicles renders; selecting a brand/filter narrows the grid; clearing filters (re-selecting the blank option) restores all results.

- [ ] **Step 3: Commit**

```bash
git add app/estoque/page.tsx
git commit -m "feat: add Estoque page with client-side filters"
```

---

## Task 6: Vehicle detail page

**Files:**
- Create: `app/estoque/[id]/page.tsx`

**Interfaces:**
- Consumes: `vehicles` from `@/lib/vehicles` (Task 2); `WhatsAppButton` from `@/components/WhatsAppButton` (Task 4).
- Produces: page at `/estoque/[id]`. No exports consumed elsewhere.

- [ ] **Step 1: Write the detail page**

Create `app/estoque/[id]/page.tsx`:

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { vehicles } from "@/lib/vehicles";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = vehicles.find((v) => v.id === params.id);
  if (!vehicle) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden mb-6">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover"
        />
      </div>

      <h1 className="text-3xl font-bold text-white">
        {vehicle.brand} {vehicle.model} {vehicle.year}
      </h1>
      <p className="text-brand-red text-2xl font-bold mt-2 mb-6">
        {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300 bg-brand-blackSoft border border-brand-gold/20 rounded-lg p-4 mb-6">
        <p><span className="text-brand-gold">Ano:</span> {vehicle.year}</p>
        <p><span className="text-brand-gold">KM:</span> {vehicle.km.toLocaleString("pt-BR")}</p>
        <p><span className="text-brand-gold">Câmbio:</span> {vehicle.transmission === "automatic" ? "Automático" : "Manual"}</p>
        <p><span className="text-brand-gold">Combustível:</span> {vehicle.fuel}</p>
        <p><span className="text-brand-gold">Cor:</span> {vehicle.color}</p>
      </div>

      <p className="text-gray-300 mb-8">{vehicle.description}</p>

      <WhatsAppButton vehicle={vehicle} />
    </div>
  );
}
```

- [ ] **Step 2: Verify manually**

Run: `npm run dev`, open `http://localhost:3000/estoque/1`.
Expected: shows the Corolla's details, price, specs, and a working WhatsApp button (href starts with `https://wa.me/`). Open `http://localhost:3000/estoque/does-not-exist` and confirm it renders Next.js's 404 page.

- [ ] **Step 3: Commit**

```bash
git add "app/estoque/[id]/page.tsx"
git commit -m "feat: add vehicle detail page"
```

---

## Task 7: Home page

**Files:**
- Modify: `app/page.tsx` (replace scaffold placeholder from Task 1)

**Interfaces:**
- Consumes: `vehicles` from `@/lib/vehicles` (Task 2); `VehicleCard` from `@/components/VehicleCard` (Task 4).
- Produces: page at `/`. No exports consumed elsewhere.

- [ ] **Step 1: Write the Home page**

Replace the contents of `app/page.tsx`:

```tsx
import Link from "next/link";
import { vehicles } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";

export default function HomePage() {
  const highlights = vehicles.slice(0, 3);

  return (
    <div>
      <section className="bg-brand-blackSoft border-b border-brand-gold/30 py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Encontre o carro <span className="text-brand-red">ideal</span> para você
        </h1>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          A VS Motors une qualidade, confiança e os melhores veículos revisados
          da região.
        </p>
        <Link
          href="/estoque"
          className="inline-block bg-brand-red text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Ver Estoque
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white mb-6">Destaques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      <section className="bg-brand-blackSoft border-t border-brand-gold/30 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Por que a VS Motors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <p><span className="text-brand-gold font-semibold block mb-1">Confiança</span>Veículos revisados e com procedência garantida.</p>
            <p><span className="text-brand-gold font-semibold block mb-1">Variedade</span>Estoque atualizado com opções para todo perfil.</p>
            <p><span className="text-brand-gold font-semibold block mb-1">Atendimento</span>Suporte direto via WhatsApp em cada anúncio.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify manually**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: hero section, "Ver Estoque" button linking to `/estoque`, 3 highlighted vehicle cards, "Por que a VS Motors" section.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build Home page with hero and highlights"
```

---

## Task 8: Sobre, Venda seu Carro, and Contato pages

**Files:**
- Create: `app/sobre/page.tsx`
- Create: `app/venda-seu-carro/page.tsx`
- Create: `app/contato/page.tsx`

**Interfaces:**
- Consumes: nothing beyond standard React/Next.
- Produces: pages at `/sobre`, `/venda-seu-carro`, `/contato`. No exports consumed elsewhere.

- [ ] **Step 1: Write the Sobre page**

Create `app/sobre/page.tsx`:

```tsx
export default function SobrePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Nossa História</h1>
      <div className="space-y-4 text-gray-300">
        <p>
          A VS Motors nasceu do sonho de oferecer veículos de qualidade com
          transparência e confiança. Ao longo dos anos, construímos uma
          reputação sólida no mercado de veículos seminovos, sempre colocando
          o cliente em primeiro lugar.
        </p>
        <p>
          Cada carro do nosso estoque passa por uma criteriosa avaliação antes
          de chegar até você, garantindo procedência, qualidade mecânica e
          documentação em dia.
        </p>
        <p>
          Hoje, a VS Motors é referência para quem busca comprar ou vender um
          veículo com segurança e o melhor atendimento da região.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the Venda seu Carro page**

Create `app/venda-seu-carro/page.tsx`:

```tsx
"use client";

import { useState } from "react";

export default function VendaSeuCarroPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Venda seu Carro</h1>
      <p className="text-gray-400 mb-8">
        Preencha os dados abaixo e nossa equipe entrará em contato para
        avaliar seu veículo.
      </p>

      {submitted ? (
        <p className="text-brand-gold">
          Obrigado! Recebemos seus dados (formulário de demonstração — envio
          real será conectado em uma fase futura).
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input required placeholder="Marca" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required placeholder="Modelo" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required type="number" placeholder="Ano" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required placeholder="Seu nome" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <input required placeholder="Telefone / WhatsApp" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" />
          <textarea placeholder="Observações (opcional)" className="w-full bg-black text-white border border-gray-700 rounded px-3 py-2" rows={4} />
          <button
            type="submit"
            className="bg-brand-red text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write the Contato page**

Create `app/contato/page.tsx`:

```tsx
export default function ContatoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Contato</h1>
      <div className="space-y-2 text-gray-300 mb-8">
        <p><span className="text-brand-gold">Telefone:</span> (00) 0000-0000</p>
        <p><span className="text-brand-gold">WhatsApp:</span> (00) 90000-0000</p>
        <p><span className="text-brand-gold">E-mail:</span> contato@vsmotors.com.br</p>
        <p><span className="text-brand-gold">Endereço:</span> Av. Exemplo, 1000 — Centro, Cidade - UF, 00000-000</p>
        <p><span className="text-brand-gold">Horário:</span> Segunda a sábado, 9h às 18h</p>
      </div>
      <div className="w-full h-64 bg-brand-blackSoft border border-brand-gold/20 rounded-lg flex items-center justify-center text-gray-500">
        Mapa (placeholder)
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify manually**

Run: `npm run dev`. Visit `/sobre`, `/venda-seu-carro`, `/contato`. On Venda seu Carro, submit the form and confirm the thank-you message replaces it.

- [ ] **Step 5: Commit**

```bash
git add app/sobre/page.tsx app/venda-seu-carro/page.tsx app/contato/page.tsx
git commit -m "feat: add Sobre, Venda seu Carro, and Contato pages"
```

---

## Task 9: Full-site smoke check

**Files:** none created/modified — verification only.

**Interfaces:** none.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all `filterVehicles` tests pass.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: builds successfully, no type errors, all 6 routes (`/`, `/estoque`, `/estoque/[id]`, `/sobre`, `/venda-seu-carro`, `/contato`) listed in the build output.

- [ ] **Step 3: Manual navigation walkthrough**

Run: `npm run dev`. Starting from `/`, click through every header nav link, then a vehicle card into its detail page, then back to Estoque and try at least two filters together. Confirm active nav item underlines correctly on each page and the mobile drawer (resize browser or use dev tools device toolbar) opens/closes and navigates.

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in full-site smoke check"
```

(Skip this step if no fixes were needed.)
