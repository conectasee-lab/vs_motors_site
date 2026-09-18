# Dashboard de Desempenho Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only dashboard page (`/admin/dashboard`) showing stock count, filtered sold-count and revenue, a brand/model grouped stock listing, and a pie chart of stock by brand.

**Architecture:** A new server component page fetches aggregated data through pure, independently-testable functions in `lib/dashboard-data.ts` (Supabase queries) and `lib/dashboard-aggregations.ts` (pure array transforms). A client component (`DashboardDateFilter`) drives the "até" date filter via the URL search param `ate`, so the server component re-fetches on navigation. Presentation is split into small, reusable client/server components under `components/dashboard/`. Recharts is added as a new dependency for the pie chart.

**Tech Stack:** Next.js 16 (App Router, server components + server actions), Supabase (`@supabase/supabase-js` via `lib/supabase/server.ts`), TypeScript, Tailwind CSS v4 (`brand-red` #c8102e / `brand-black` #0a0a0a tokens in `app/globals.css`), Vitest + Testing Library, Recharts (new).

**Spec:** docs/superpowers/specs/2026-09-18-dashboard-desempenho-design.md

## Global Constraints

- Dashboard is protected: every server entry point calls `requireUser()` from `lib/auth.ts` (redirects to `/login` if unauthenticated), same as all `/admin/*` pages.
- Default period (no `ate` param) = current calendar month, based on `sold_at`.
- The `ate` date filter applies ONLY to sold-count and revenue metrics. The grouped stock listing and the pie chart always reflect full current stock, unfiltered.
- Pie chart is based on stock vehicle counts per brand (same data source as the grouped listing), not the `brands` table row count.
- No ORM: all data access goes through the Supabase client from `lib/supabase/server.ts`, following the existing pattern in `lib/vehicles-data.ts`.
- Currency formatting: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Colors: use existing Tailwind tokens `brand-red` / `brand-black`, not the reference image's exact palette.

---

## File Structure

- `package.json` — add `recharts` dependency.
- `lib/dashboard-aggregations.ts` — **new**. Pure functions: sum revenue, count rows, group vehicles by brand, count vehicles per brand. No Supabase imports, fully unit-testable with plain arrays.
- `lib/dashboard-aggregations.test.ts` — **new**. Unit tests for the above.
- `lib/dashboard-data.ts` — **new**. Supabase-calling functions: `getEstoqueTotal`, `getVendasResumo`, `getEstoqueComMarca` (raw fetch used by both the grouped listing and the pie chart). Thin wrappers delegating aggregation to `dashboard-aggregations.ts`.
- `lib/dashboard-data.test.ts` — **new**. Tests using the same Supabase-mocking pattern as `app/admin/marcas/actions.test.ts`.
- `components/dashboard/MetricCard.tsx` — **new**. Presentational server component: icon, label, big value, accent color.
- `components/dashboard/DashboardDateFilter.tsx` — **new**. Client component: date input bound to the `ate` search param.
- `components/dashboard/EstoquePorMarcaLista.tsx` — **new**. Server component: renders grouped-by-brand stock listing.
- `components/dashboard/EstoquePorMarcaPizza.tsx` — **new**. Client component wrapping Recharts `PieChart`.
- `components/DashboardLinkButton.tsx` — **new**. Small reusable `Link` to `/admin/dashboard`, styled like `BackToEstoqueButton`.
- `app/admin/dashboard/page.tsx` — **new**. Server component page wiring everything together.
- Modify (add `DashboardLinkButton` next to existing `BackToEstoqueButton`/header actions): `app/admin/marcas/page.tsx`, `app/admin/acessorios/page.tsx`, `app/admin/carrocerias/page.tsx`, `app/admin/contato/page.tsx`, `app/admin/usuarios/page.tsx`, `app/estoque/page.tsx`.

---

### Task 1: Pure aggregation helpers

**Files:**
- Create: `lib/dashboard-aggregations.ts`
- Test: `lib/dashboard-aggregations.test.ts`

**Interfaces:**
- Produces:
  - `type SoldVehicleRow = { price: number }`
  - `sumRevenue(rows: SoldVehicleRow[]): number`
  - `type StockVehicleRow = { id: string; model: string; year: number; brandName: string }`
  - `type MarcaGroup = { marca: string; veiculos: { id: string; model: string; year: number }[] }`
  - `groupByBrand(rows: StockVehicleRow[]): MarcaGroup[]` — groups by `brandName`, sorted alphabetically by `marca` (locale `pt-BR`), each group's `veiculos` in the input order.
  - `type MarcaCount = { marca: string; quantidade: number }`
  - `countByBrand(rows: StockVehicleRow[]): MarcaCount[]` — one entry per distinct brand, sorted by `quantidade` descending, ties broken alphabetically.

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { sumRevenue, groupByBrand, countByBrand } from "./dashboard-aggregations";

describe("sumRevenue", () => {
  it("sums the price field across rows", () => {
    expect(sumRevenue([{ price: 1000 }, { price: 2500.5 }])).toBe(3500.5);
  });

  it("returns 0 for an empty list", () => {
    expect(sumRevenue([])).toBe(0);
  });
});

describe("groupByBrand", () => {
  it("groups vehicles by brand name, sorted alphabetically", () => {
    const rows = [
      { id: "1", model: "Corolla", year: 2020, brandName: "Toyota" },
      { id: "2", model: "Onix", year: 2021, brandName: "Chevrolet" },
      { id: "3", model: "Hilux", year: 2022, brandName: "Toyota" },
    ];

    expect(groupByBrand(rows)).toEqual([
      { marca: "Chevrolet", veiculos: [{ id: "2", model: "Onix", year: 2021 }] },
      {
        marca: "Toyota",
        veiculos: [
          { id: "1", model: "Corolla", year: 2020 },
          { id: "3", model: "Hilux", year: 2022 },
        ],
      },
    ]);
  });

  it("returns an empty list for no vehicles", () => {
    expect(groupByBrand([])).toEqual([]);
  });
});

describe("countByBrand", () => {
  it("counts vehicles per brand, sorted by count descending", () => {
    const rows = [
      { id: "1", model: "Corolla", year: 2020, brandName: "Toyota" },
      { id: "2", model: "Onix", year: 2021, brandName: "Chevrolet" },
      { id: "3", model: "Hilux", year: 2022, brandName: "Toyota" },
    ];

    expect(countByBrand(rows)).toEqual([
      { marca: "Toyota", quantidade: 2 },
      { marca: "Chevrolet", quantidade: 1 },
    ]);
  });

  it("breaks ties alphabetically", () => {
    const rows = [
      { id: "1", model: "Onix", year: 2021, brandName: "Chevrolet" },
      { id: "2", model: "Corolla", year: 2020, brandName: "Toyota" },
    ];

    expect(countByBrand(rows)).toEqual([
      { marca: "Chevrolet", quantidade: 1 },
      { marca: "Toyota", quantidade: 1 },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/dashboard-aggregations.test.ts`
Expected: FAIL with "Cannot find module './dashboard-aggregations'" (or similar — file doesn't exist yet).

- [ ] **Step 3: Implement**

```typescript
export type SoldVehicleRow = { price: number };

export function sumRevenue(rows: SoldVehicleRow[]): number {
  return rows.reduce((total, row) => total + row.price, 0);
}

export type StockVehicleRow = { id: string; model: string; year: number; brandName: string };
export type MarcaGroup = { marca: string; veiculos: { id: string; model: string; year: number }[] };

export function groupByBrand(rows: StockVehicleRow[]): MarcaGroup[] {
  const groups = new Map<string, MarcaGroup["veiculos"]>();
  for (const row of rows) {
    const existing = groups.get(row.brandName);
    const veiculo = { id: row.id, model: row.model, year: row.year };
    if (existing) {
      existing.push(veiculo);
    } else {
      groups.set(row.brandName, [veiculo]);
    }
  }
  return Array.from(groups.entries())
    .map(([marca, veiculos]) => ({ marca, veiculos }))
    .sort((a, b) => a.marca.localeCompare(b.marca, "pt-BR"));
}

export type MarcaCount = { marca: string; quantidade: number };

export function countByBrand(rows: StockVehicleRow[]): MarcaCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.brandName, (counts.get(row.brandName) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([marca, quantidade]) => ({ marca, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade || a.marca.localeCompare(b.marca, "pt-BR"));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/dashboard-aggregations.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/dashboard-aggregations.ts lib/dashboard-aggregations.test.ts
git commit -m "feat: add pure aggregation helpers for dashboard"
```

---

### Task 2: Supabase-backed data functions

**Files:**
- Create: `lib/dashboard-data.ts`
- Test: `lib/dashboard-data.test.ts`

**Interfaces:**
- Consumes: `sumRevenue`, `groupByBrand`, `countByBrand`, `StockVehicleRow`, `SoldVehicleRow` from `lib/dashboard-aggregations.ts` (Task 1); `createServerSupabaseClient` from `lib/supabase/server.ts`.
- Produces:
  - `getEstoqueTotal(): Promise<number>`
  - `getVendasResumo(ateDate?: string): Promise<{ quantidade: number; faturamento: number }>` — `ateDate` is an ISO date string (`YYYY-MM-DD`); when omitted, defaults to "now" (end of current month is handled by the caller via `defaultAteDate` below).
  - `defaultAteDate(): string` — returns today's date as `YYYY-MM-DD` (used by the page as the default `ate` when none is in the URL, combined with a fixed month-start lower bound).
  - `getEstoqueAgrupadoPorMarca(): Promise<import("./dashboard-aggregations").MarcaGroup[]>`
  - `getEstoquePorMarcaParaGrafico(): Promise<import("./dashboard-aggregations").MarcaCount[]>`

**Design note:** `getVendasResumo` always filters `sold_at >= <first day of current month>` AND `sold_at <= ateDate` — the spec's decision #2 says the default view is "current month", and decision #3 only asks that the *stock* views stay unfiltered, not that the sales metrics show all-time by default. `ateDate` narrows the end of the current month; passing today's date as `ateDate` is a no-op filter beyond the month-start bound.

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const fromMock = vi.fn();

vi.mock("./supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ from: fromMock })),
}));

beforeEach(() => {
  fromMock.mockReset();
});

describe("getEstoqueTotal", () => {
  it("returns the count of rows in vehicles", async () => {
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("vehicles");
      return { select: vi.fn().mockResolvedValue({ count: 42, error: null }) };
    });

    const { getEstoqueTotal } = await import("./dashboard-data");
    expect(await getEstoqueTotal()).toBe(42);
  });

  it("returns 0 on error", async () => {
    fromMock.mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({ count: null, error: { message: "boom" } }),
    }));

    const { getEstoqueTotal } = await import("./dashboard-data");
    expect(await getEstoqueTotal()).toBe(0);
  });
});

describe("getVendasResumo", () => {
  it("sums price and counts rows sold at or before ateDate, from the start of the current month", async () => {
    const gteMock = vi.fn();
    const lteMock = vi.fn().mockResolvedValue({
      data: [{ price: 1000 }, { price: 2000 }],
      error: null,
    });
    gteMock.mockReturnValue({ lte: lteMock });
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("sold_vehicles");
      return { select: vi.fn().mockReturnValue({ gte: gteMock }) };
    });

    const { getVendasResumo } = await import("./dashboard-data");
    const result = await getVendasResumo("2026-09-18");

    expect(result).toEqual({ quantidade: 2, faturamento: 3000 });
    expect(lteMock).toHaveBeenCalledWith("sold_at", "2026-09-18");
  });

  it("returns zeros on error", async () => {
    fromMock.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({ lte: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }) }),
      }),
    }));

    const { getVendasResumo } = await import("./dashboard-data");
    expect(await getVendasResumo("2026-09-18")).toEqual({ quantidade: 0, faturamento: 0 });
  });
});

describe("getEstoqueAgrupadoPorMarca / getEstoquePorMarcaParaGrafico", () => {
  const rows = [
    { id: "1", model: "Corolla", year: 2020, brand: { name: "Toyota" } },
    { id: "2", model: "Onix", year: 2021, brand: { name: "Chevrolet" } },
  ];

  it("groups stock vehicles by brand", async () => {
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("vehicles");
      return { select: vi.fn().mockResolvedValue({ data: rows, error: null }) };
    });

    const { getEstoqueAgrupadoPorMarca } = await import("./dashboard-data");
    expect(await getEstoqueAgrupadoPorMarca()).toEqual([
      { marca: "Chevrolet", veiculos: [{ id: "2", model: "Onix", year: 2021 }] },
      { marca: "Toyota", veiculos: [{ id: "1", model: "Corolla", year: 2020 }] },
    ]);
  });

  it("counts stock vehicles by brand for the chart", async () => {
    fromMock.mockImplementation(() => ({ select: vi.fn().mockResolvedValue({ data: rows, error: null }) }));

    const { getEstoquePorMarcaParaGrafico } = await import("./dashboard-data");
    expect(await getEstoquePorMarcaParaGrafico()).toEqual([
      { marca: "Chevrolet", quantidade: 1 },
      { marca: "Toyota", quantidade: 1 },
    ]);
  });

  it("returns an empty list on error", async () => {
    fromMock.mockImplementation(() => ({ select: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }) }));

    const { getEstoqueAgrupadoPorMarca } = await import("./dashboard-data");
    expect(await getEstoqueAgrupadoPorMarca()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/dashboard-data.test.ts`
Expected: FAIL with "Cannot find module './dashboard-data'"

- [ ] **Step 3: Implement**

```typescript
import { createServerSupabaseClient } from "./supabase/server";
import { sumRevenue, groupByBrand, countByBrand, type StockVehicleRow } from "./dashboard-aggregations";

export function defaultAteDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function getEstoqueTotal(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase.from("vehicles").select("id", { count: "exact", head: true });
  if (error) {
    console.error(`Falha ao contar estoque: ${error.message}`);
    return 0;
  }
  return count ?? 0;
}

export async function getVendasResumo(
  ateDate: string = defaultAteDate()
): Promise<{ quantidade: number; faturamento: number }> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sold_vehicles")
    .select("price")
    .gte("sold_at", firstDayOfCurrentMonth())
    .lte("sold_at", ateDate);

  if (error) {
    console.error(`Falha ao carregar vendas: ${error.message}`);
    return { quantidade: 0, faturamento: 0 };
  }
  const rows = data ?? [];
  return { quantidade: rows.length, faturamento: sumRevenue(rows) };
}

type StockRowWithBrand = { id: string; model: string; year: number; brand: { name: string } | null };

async function fetchStockWithBrand(): Promise<StockVehicleRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("vehicles").select("id, model, year, brand:brands(name)");
  if (error) {
    console.error(`Falha ao carregar estoque por marca: ${error.message}`);
    return [];
  }
  return (data as unknown as StockRowWithBrand[]).map((row) => ({
    id: row.id,
    model: row.model,
    year: row.year,
    brandName: row.brand?.name ?? "Sem marca",
  }));
}

export async function getEstoqueAgrupadoPorMarca() {
  return groupByBrand(await fetchStockWithBrand());
}

export async function getEstoquePorMarcaParaGrafico() {
  return countByBrand(await fetchStockWithBrand());
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/dashboard-data.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/dashboard-data.ts lib/dashboard-data.test.ts
git commit -m "feat: add Supabase-backed data functions for dashboard"
```

---

### Task 3: Add Recharts dependency

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `recharts` importable as `import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"` for Task 6.

- [ ] **Step 1: Install the dependency**

Run: `npm install recharts`
Expected: `package.json` gains a `recharts` entry under `dependencies`; `package-lock.json` updates.

- [ ] **Step 2: Verify it installed correctly**

Run: `node -e "require.resolve('recharts')"`
Expected: no output, exit code 0 (module resolves).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts for dashboard pie chart"
```

---

### Task 4: MetricCard and DashboardDateFilter components

**Files:**
- Create: `components/dashboard/MetricCard.tsx`
- Create: `components/dashboard/DashboardDateFilter.tsx`

**Interfaces:**
- Produces:
  - `MetricCard(props: { label: string; value: string; accentColor: "red" | "green" | "black"; icon: React.ReactNode }): JSX.Element` — server component (no `"use client"`).
  - `DashboardDateFilter(props: { initialAte: string }): JSX.Element` — client component; renders `<input type="date">`; on change, navigates to `/admin/dashboard?ate=<value>` via `useRouter().push`.

- [ ] **Step 1: Write the failing test**

```typescript
// components/dashboard/MetricCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MetricCard from "./MetricCard";

describe("MetricCard", () => {
  it("renders the label and the big value", () => {
    render(<MetricCard label="Carros em Estoque" value="128" accentColor="red" icon={<span data-testid="icon" />} />);

    expect(screen.getByText("Carros em Estoque")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/dashboard/MetricCard.test.tsx`
Expected: FAIL with "Cannot find module './MetricCard'"

- [ ] **Step 3: Implement MetricCard**

```tsx
import type { ReactNode } from "react";

const ACCENT_CLASSES: Record<"red" | "green" | "black", string> = {
  red: "bg-brand-red/10 text-brand-red",
  green: "bg-green-100 text-green-700",
  black: "bg-brand-black/10 text-brand-black",
};

export default function MetricCard({
  label,
  value,
  accentColor,
  icon,
}: {
  label: string;
  value: string;
  accentColor: "red" | "green" | "black";
  icon: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ACCENT_CLASSES[accentColor]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-brand-black">{value}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/dashboard/MetricCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Write the failing test for DashboardDateFilter**

```tsx
// components/dashboard/DashboardDateFilter.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockReset();
});

describe("DashboardDateFilter", () => {
  it("renders the initial date", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialAte="2026-09-18" />);

    expect(screen.getByLabelText("Vendas até")).toHaveValue("2026-09-18");
  });

  it("navigates to the dashboard with the new date on change", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialAte="2026-09-18" />);

    fireEvent.change(screen.getByLabelText("Vendas até"), { target: { value: "2026-09-01" } });

    expect(pushMock).toHaveBeenCalledWith("/admin/dashboard?ate=2026-09-01");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run components/dashboard/DashboardDateFilter.test.tsx`
Expected: FAIL with "Cannot find module './DashboardDateFilter'"

- [ ] **Step 7: Implement DashboardDateFilter**

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function DashboardDateFilter({ initialAte }: { initialAte: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
      Vendas até
      <input
        type="date"
        defaultValue={initialAte}
        onChange={(e) => router.push(`/admin/dashboard?ate=${e.target.value}`)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-brand-black"
      />
    </label>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run components/dashboard/DashboardDateFilter.test.tsx`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add components/dashboard/MetricCard.tsx components/dashboard/MetricCard.test.tsx components/dashboard/DashboardDateFilter.tsx components/dashboard/DashboardDateFilter.test.tsx
git commit -m "feat: add MetricCard and DashboardDateFilter components"
```

---

### Task 5: EstoquePorMarcaLista component

**Files:**
- Create: `components/dashboard/EstoquePorMarcaLista.tsx`
- Test: `components/dashboard/EstoquePorMarcaLista.test.tsx`

**Interfaces:**
- Consumes: `MarcaGroup` type from `lib/dashboard-aggregations.ts` (Task 1).
- Produces: `EstoquePorMarcaLista(props: { grupos: MarcaGroup[] }): JSX.Element` — server component.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EstoquePorMarcaLista from "./EstoquePorMarcaLista";

describe("EstoquePorMarcaLista", () => {
  it("renders each brand with its vehicles", () => {
    render(
      <EstoquePorMarcaLista
        grupos={[
          { marca: "Toyota", veiculos: [{ id: "1", model: "Corolla", year: 2020 }] },
          { marca: "Chevrolet", veiculos: [{ id: "2", model: "Onix", year: 2021 }] },
        ]}
      />
    );

    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Corolla (2020)")).toBeInTheDocument();
    expect(screen.getByText("Chevrolet")).toBeInTheDocument();
    expect(screen.getByText("Onix (2021)")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no groups", () => {
    render(<EstoquePorMarcaLista grupos={[]} />);
    expect(screen.getByText("Nenhum veículo em estoque.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/dashboard/EstoquePorMarcaLista.test.tsx`
Expected: FAIL with "Cannot find module './EstoquePorMarcaLista'"

- [ ] **Step 3: Implement**

```tsx
import type { MarcaGroup } from "@/lib/dashboard-aggregations";

export default function EstoquePorMarcaLista({ grupos }: { grupos: MarcaGroup[] }) {
  if (grupos.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum veículo em estoque.</p>;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {grupos.map((grupo) => (
        <div key={grupo.marca}>
          <p className="font-semibold text-brand-black mb-1">{grupo.marca}</p>
          <ul className="space-y-1 pl-3">
            {grupo.veiculos.map((v) => (
              <li key={v.id} className="text-sm text-gray-600">
                {v.model} ({v.year})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/dashboard/EstoquePorMarcaLista.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/EstoquePorMarcaLista.tsx components/dashboard/EstoquePorMarcaLista.test.tsx
git commit -m "feat: add EstoquePorMarcaLista component"
```

---

### Task 6: EstoquePorMarcaPizza component (Recharts pie chart)

**Files:**
- Create: `components/dashboard/EstoquePorMarcaPizza.tsx`
- Test: `components/dashboard/EstoquePorMarcaPizza.test.tsx`

**Interfaces:**
- Consumes: `MarcaCount` type from `lib/dashboard-aggregations.ts` (Task 1); `recharts` (Task 3).
- Produces: `EstoquePorMarcaPizza(props: { dados: MarcaCount[] }): JSX.Element` — client component (`"use client"`, required by Recharts).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EstoquePorMarcaPizza from "./EstoquePorMarcaPizza";

describe("EstoquePorMarcaPizza", () => {
  it("shows an empty-state message when there is no data", () => {
    render(<EstoquePorMarcaPizza dados={[]} />);
    expect(screen.getByText("Nenhum veículo em estoque.")).toBeInTheDocument();
  });

  it("renders a legend entry per brand when there is data", () => {
    render(
      <EstoquePorMarcaPizza
        dados={[
          { marca: "Toyota", quantidade: 2 },
          { marca: "Chevrolet", quantidade: 1 },
        ]}
      />
    );

    expect(screen.getByText(/Toyota/)).toBeInTheDocument();
    expect(screen.getByText(/Chevrolet/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/dashboard/EstoquePorMarcaPizza.test.tsx`
Expected: FAIL with "Cannot find module './EstoquePorMarcaPizza'"

- [ ] **Step 3: Implement**

```tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { MarcaCount } from "@/lib/dashboard-aggregations";

const COLORS = ["#c8102e", "#0a0a0a", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#64748b"];

export default function EstoquePorMarcaPizza({ dados }: { dados: MarcaCount[] }) {
  if (dados.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum veículo em estoque.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={dados} dataKey="quantidade" nameKey="marca" cx="50%" cy="50%" outerRadius={90} label>
          {dados.map((entry, index) => (
            <Cell key={entry.marca} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/dashboard/EstoquePorMarcaPizza.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/EstoquePorMarcaPizza.tsx components/dashboard/EstoquePorMarcaPizza.test.tsx
git commit -m "feat: add EstoquePorMarcaPizza chart component"
```

---

### Task 7: Dashboard page

**Files:**
- Create: `app/admin/dashboard/page.tsx`

**Interfaces:**
- Consumes: `requireUser` (`lib/auth.ts`); `getEstoqueTotal`, `getVendasResumo`, `getEstoqueAgrupadoPorMarca`, `getEstoquePorMarcaParaGrafico`, `defaultAteDate` (`lib/dashboard-data.ts`, Task 2); `MetricCard`, `DashboardDateFilter` (Task 4); `EstoquePorMarcaLista` (Task 5); `EstoquePorMarcaPizza` (Task 6); `BackToEstoqueButton` (existing, `components/BackToEstoqueButton.tsx`).
- Produces: page rendered at route `/admin/dashboard`, reading `?ate=YYYY-MM-DD` from `searchParams`.

No unit test for this task: it is a server component whose data-fetching and formatting logic is already covered by Tasks 1–2, and whose child components are covered by Tasks 4–6. Verification is manual (Step 3 below), matching how other `/admin/*` pages in this repo are handled (e.g. `app/admin/marcas/page.tsx` has no page-level test).

- [ ] **Step 1: Implement the page**

```tsx
import { requireUser } from "@/lib/auth";
import {
  getEstoqueTotal,
  getVendasResumo,
  getEstoqueAgrupadoPorMarca,
  getEstoquePorMarcaParaGrafico,
  defaultAteDate,
} from "@/lib/dashboard-data";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardDateFilter from "@/components/dashboard/DashboardDateFilter";
import EstoquePorMarcaLista from "@/components/dashboard/EstoquePorMarcaLista";
import EstoquePorMarcaPizza from "@/components/dashboard/EstoquePorMarcaPizza";
import BackToEstoqueButton from "@/components/BackToEstoqueButton";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ate?: string }>;
}) {
  await requireUser();
  const { ate } = await searchParams;
  const ateDate = ate ?? defaultAteDate();

  const [estoqueTotal, vendasResumo, grupos, dadosGrafico] = await Promise.all([
    getEstoqueTotal(),
    getVendasResumo(ateDate),
    getEstoqueAgrupadoPorMarca(),
    getEstoquePorMarcaParaGrafico(),
  ]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-brand-black">Dashboard</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <DashboardDateFilter initialAte={ateDate} />
            <BackToEstoqueButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            label="Carros em Estoque"
            value={String(estoqueTotal)}
            accentColor="black"
            icon={<span>🚗</span>}
          />
          <MetricCard
            label="Carros Vendidos"
            value={String(vendasResumo.quantidade)}
            accentColor="green"
            icon={<span>✅</span>}
          />
          <MetricCard
            label="Faturamento"
            value={currencyFormatter.format(vendasResumo.faturamento)}
            accentColor="red"
            icon={<span>💰</span>}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-brand-black mb-4">Estoque por Marca e Modelo</h2>
            <EstoquePorMarcaLista grupos={grupos} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-brand-black mb-4">Estoque por Marca</h2>
            <EstoquePorMarcaPizza dados={dadosGrafico} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, then visit `http://localhost:3000/admin/dashboard` while logged in (or confirm redirect to `/login` when logged out). Confirm:
- Three metric cards show numbers.
- Changing the date input updates the URL and the "Carros Vendidos"/"Faturamento" cards, without changing the stock listing or pie chart.
- The grouped listing and pie chart both reflect current stock.

- [ ] **Step 4: Commit**

```bash
git add app/admin/dashboard/page.tsx
git commit -m "feat: add dashboard page at /admin/dashboard"
```

---

### Task 8: Link to the dashboard from existing admin pages

**Files:**
- Create: `components/DashboardLinkButton.tsx`
- Modify: `app/admin/marcas/page.tsx`
- Modify: `app/admin/acessorios/page.tsx`
- Modify: `app/admin/carrocerias/page.tsx`
- Modify: `app/admin/contato/page.tsx`
- Modify: `app/admin/usuarios/page.tsx`
- Modify: `app/estoque/page.tsx`

**Interfaces:**
- Produces: `DashboardLinkButton(): JSX.Element` — server component, plain `Link` styled like `BackToEstoqueButton`.
- Consumes (in each modified page): renders `<DashboardLinkButton />` next to the existing `<BackToEstoqueButton />` (or, on `app/estoque/page.tsx`, next to whatever admin-entry link already exists there).

- [ ] **Step 1: Implement DashboardLinkButton**

```tsx
import Link from "next/link";

export default function DashboardLinkButton() {
  return (
    <Link
      href="/admin/dashboard"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white font-semibold rounded-lg text-sm hover:bg-brand-black-soft transition-colors"
    >
      Dashboard
    </Link>
  );
}
```

- [ ] **Step 2: Add the link to `app/admin/marcas/page.tsx`**

In the header's action row (next to `<BackToEstoqueButton />`, around line 21), add the import at the top:

```tsx
import DashboardLinkButton from "@/components/DashboardLinkButton";
```

and render it alongside the existing button:

```tsx
<DashboardLinkButton />
<BackToEstoqueButton />
```

- [ ] **Step 3: Repeat Step 2's pattern for the remaining pages**

Open each of `app/admin/acessorios/page.tsx`, `app/admin/carrocerias/page.tsx`, `app/admin/contato/page.tsx`, `app/admin/usuarios/page.tsx`, `app/estoque/page.tsx`. In each, find where `BackToEstoqueButton` (or the page's equivalent header action) is rendered, add the same import, and render `<DashboardLinkButton />` immediately before it. Preserve each file's existing layout classes — only add the one line for the import and the one line for the component.

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`. Visit `/admin/marcas`, `/admin/acessorios`, `/admin/carrocerias`, `/admin/contato`, `/admin/usuarios`, and `/estoque`. Confirm each shows a "Dashboard" link that navigates to `/admin/dashboard`.

- [ ] **Step 6: Commit**

```bash
git add components/DashboardLinkButton.tsx app/admin/marcas/page.tsx app/admin/acessorios/page.tsx app/admin/carrocerias/page.tsx app/admin/contato/page.tsx app/admin/usuarios/page.tsx app/estoque/page.tsx
git commit -m "feat: link to the new dashboard from existing admin pages"
```

---

### Task 9: Full test suite run

**Files:** none (verification-only task)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the new files from Tasks 1, 2, 4, 5, 6.

- [ ] **Step 2: Run the full type check and lint one more time**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit if anything changed**

If Step 1 or Step 2 required fixes, stage and commit them:

```bash
git add -A
git commit -m "fix: address issues found in full dashboard test run"
```

If nothing changed, skip this step — there is nothing to commit.
