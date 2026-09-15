# CRUD de marcas de veículos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the free-text `brand` field on vehicles with a proper `brands` entity (name + logo image), manageable through an internal CRUD, and linked to vehicles via `brand_id`.

**Architecture:** New `brands` table + `brand-logos` Supabase Storage bucket, mirroring the existing `vehicles`/`vehicle-photos` pattern (public read, authenticated write, server actions + server components, no role distinction). `vehicles.brand` (text) is replaced by `vehicles.brand_id` (uuid FK, nullable). All vehicle-side code that read `vehicle.brand` as a string switches to reading `vehicle.brand?.name` / `vehicle.brand?.logoUrl` from a joined object, and filtering switches from matching a brand string to matching a `brandId`.

**Tech Stack:** Next.js App Router (server actions, server components), Supabase Postgres + Storage + Auth, TypeScript, Vitest.

**Spec:** [docs/superpowers/specs/2026-09-15-brand-crud-design.md](../specs/2026-09-15-brand-crud-design.md)

## Global Constraints

- Any authenticated user (no role distinction) can manage brands — same as vehicles today.
- No automatic migration of existing free-text `brand` values; `brands` starts empty and existing vehicles keep `brand_id = null` until manually re-edited.
- Vehicle form uses a plain `<select>` (name only) for brand; the logo is shown on the vehicle card/detail, not inside the select.
- Brand `name` is unique; deleting a brand referenced by any vehicle must be blocked with an error.
- Follow the existing codebase pattern: server actions in `actions.ts` next to the pages that use them, `requireUser()` for any write, `revalidatePath` after mutations, Vitest for action/unit tests, Portuguese UI copy and error messages matching the existing tone (see `app/estoque/actions.ts`, `app/admin/usuarios/actions.ts`).

---

## Task 1: Database schema — `brands` table, `vehicles.brand_id`, RLS, storage policies

**Files:**
- Modify: `supabase/schema.sql`

**Interfaces:**
- Produces: `brands` table (`id uuid`, `name text unique not null`, `logo_url text`, `created_at timestamptz`); `vehicles.brand_id uuid references brands(id)` replacing `vehicles.brand text`; RLS policies on `brands`; storage policies for bucket `brand-logos`.

This project's Supabase schema is applied manually against the live project (see the file's own header comment) — there's no migration runner or automated test for this task. The deliverable is the updated SQL file plus you running it against the Supabase project's SQL editor.

- [ ] **Step 1: Append the new schema to `supabase/schema.sql`**

Add this at the end of the file:

```sql
-- Brands: CRUD entity for vehicle brands (name + logo), linked from vehicles.

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table brands enable row level security;

create policy "public can read brands"
  on brands for select
  using (true);

create policy "authenticated users can insert brands"
  on brands for insert
  to authenticated
  with check (true);

create policy "authenticated users can update brands"
  on brands for update
  to authenticated
  using (true);

create policy "authenticated users can delete brands"
  on brands for delete
  to authenticated
  using (true);

alter table vehicles
  drop column if exists brand,
  add column if not exists brand_id uuid references brands(id);

-- Storage: the "brand-logos" bucket must be created manually (Storage ->
-- New bucket -> name "brand-logos" -> Public bucket), same as vehicle-photos.

create policy "public can view brand logos"
  on storage.objects for select
  to public
  using (bucket_id = 'brand-logos');

create policy "authenticated users can upload brand logos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'brand-logos');

create policy "authenticated users can update brand logos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'brand-logos');

create policy "authenticated users can delete brand logos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'brand-logos');
```

- [ ] **Step 2: Run the new SQL against the live Supabase project**

In the Supabase dashboard SQL editor, run exactly the block added in Step 1 (not the whole file, since `vehicles`/`vehicle-photos` already exist). Then create the `brand-logos` bucket manually: Storage → New bucket → name `brand-logos` → Public bucket.

- [ ] **Step 3: Verify manually**

In the Supabase table editor, confirm `brands` exists with columns `id, name, logo_url, created_at`, and `vehicles` has a new nullable `brand_id` column and no `brand` column.

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add brands table and vehicles.brand_id column"
```

---

## Task 2: `lib/brands.ts` — Brand type and data access

**Files:**
- Create: `lib/brands.ts`
- Test: `lib/brands.test.ts`

**Interfaces:**
- Produces:
  - `type Brand = { id: string; name: string; logoUrl: string | null }`
  - `async function getBrands(): Promise<Brand[]>` — all brands, ordered by name ascending.
  - `async function getBrandById(id: string): Promise<Brand | null>`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/brands.test.ts
import { describe, it, expect, vi } from "vitest";

const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock }));
const eqMock = vi.fn();
const maybeSingleMock = vi.fn();
const fromMock = vi.fn(() => ({
  select: (columns: string) => {
    if (columns === "*") return { order: orderMock, eq: eqMock };
    return selectMock(columns);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getBrands", () => {
  it("maps rows to Brand objects ordered by name", async () => {
    orderMock.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Toyota", logo_url: "https://x/toyota.png" },
        { id: "2", name: "Honda", logo_url: null },
      ],
      error: null,
    });

    const { getBrands } = await import("./brands");
    const result = await getBrands();

    expect(result).toEqual([
      { id: "1", name: "Toyota", logoUrl: "https://x/toyota.png" },
      { id: "2", name: "Honda", logoUrl: null },
    ]);
  });

  it("returns an empty array on error", async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    const { getBrands } = await import("./brands");
    const result = await getBrands();

    expect(result).toEqual([]);
  });
});

describe("getBrandById", () => {
  it("returns null when not found", async () => {
    eqMock.mockReturnValueOnce({ maybeSingle: maybeSingleMock });
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null });

    const { getBrandById } = await import("./brands");
    const result = await getBrandById("missing");

    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/brands.test.ts`
Expected: FAIL — `Cannot find module './brands'`

- [ ] **Step 3: Write the implementation**

```typescript
// lib/brands.ts
import { createServerSupabaseClient } from "./supabase/server";

export type Brand = {
  id: string;
  name: string;
  logoUrl: string | null;
};

type BrandRow = {
  id: string;
  name: string;
  logo_url: string | null;
};

function toBrand(row: BrandRow): Brand {
  return { id: row.id, name: row.name, logoUrl: row.logo_url };
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(`Falha ao carregar marcas: ${error.message}`);
    return [];
  }
  return (data as BrandRow[]).map(toBrand);
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar marca: ${error.message}`);
  return data ? toBrand(data as BrandRow) : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/brands.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/brands.ts lib/brands.test.ts
git commit -m "feat: add Brand type and data access functions"
```

---

## Task 3: Brand CRUD server actions

**Files:**
- Create: `app/admin/marcas/actions.ts`
- Test: `app/admin/marcas/actions.test.ts`

**Interfaces:**
- Consumes: `requireUser` from `@/lib/auth`; `createServerSupabaseClient` from `@/lib/supabase/server`.
- Produces:
  - `type ActionResult = { error: string | null }`
  - `async function createBrandAction(formData: FormData): Promise<ActionResult>` — reads `name`, `logo` (File, optional); redirects to `/admin/marcas` on success.
  - `async function updateBrandAction(id: string, currentLogoUrl: string | null, formData: FormData): Promise<ActionResult>` — reads `name`, `logo` (File, optional); redirects to `/admin/marcas` on success.
  - `async function deleteBrandAction(id: string): Promise<ActionResult>` — blocks deletion if any vehicle references the brand; redirects to `/admin/marcas` on success.

- [ ] **Step 1: Write the failing tests**

```typescript
// app/admin/marcas/actions.test.ts
import { describe, it, expect, vi } from "vitest";

const requireUserMock = vi.fn();
const fromMock = vi.fn();
const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    from: fromMock,
    storage: {
      from: () => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }),
    },
  })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

describe("createBrandAction", () => {
  it("returns an error and never touches the database when there is no session", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("REDIRECT:/login"));
    const { createBrandAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "Toyota");

    await expect(createBrandAction(fd)).rejects.toThrow("REDIRECT:/login");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns an error when name is empty", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const { createBrandAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "   ");

    const result = await createBrandAction(fd);
    expect(result).toEqual({ error: "Informe o nome da marca." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserts the brand without a logo when none is provided", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("brands");
      return { insert: insertMock };
    });

    const { createBrandAction } = await import("./actions");
    const fd = new FormData();
    fd.set("name", "Toyota");

    const result = await createBrandAction(fd);

    expect(result).toEqual({ error: null });
    expect(insertMock).toHaveBeenCalledWith({ name: "Toyota", logo_url: null });
  });

  it("returns a friendly error when the name is already taken", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const insertMock = vi.fn().mockResolvedValue({ error: { message: "duplicate key value violates unique constraint" } });
    fromMock.mockReturnValue({ insert: insertMock });

    const { createBrandAction } = await import("./actions");
    const fd = new FormData();
    fd.set("name", "Toyota");

    const result = await createBrandAction(fd);
    expect(result).toEqual({ error: "Já existe uma marca com esse nome." });
  });
});

describe("deleteBrandAction", () => {
  it("blocks deletion when the brand is referenced by vehicles", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") {
        return {
          select: () => ({
            eq: () => Promise.resolve({ count: 2, error: null }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteBrandAction } = await import("./actions");
    const result = await deleteBrandAction("b1");

    expect(result).toEqual({ error: "Marca em uso por 2 veículo(s), remova o vínculo antes de excluir." });
  });

  it("deletes the brand when no vehicle references it", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") {
        return { select: () => ({ eq: () => Promise.resolve({ count: 0, error: null }) }) };
      }
      if (table === "brands") {
        return { delete: () => ({ eq: deleteEqMock }) };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteBrandAction } = await import("./actions");
    const result = await deleteBrandAction("b1");

    expect(result).toEqual({ error: null });
    expect(deleteEqMock).toHaveBeenCalledWith("id", "b1");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run app/admin/marcas/actions.test.ts`
Expected: FAIL — `Cannot find module './actions'`

- [ ] **Step 3: Write the implementation**

```typescript
// app/admin/marcas/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null };

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  file: File
): Promise<string> {
  const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from("brand-logos").upload(path, file);
  if (error) throw new Error(`Falha ao enviar logo: ${error.message}`);
  const { data } = supabase.storage.from("brand-logos").getPublicUrl(path);
  return data.publicUrl;
}

function friendlyInsertError(message: string): string {
  if (message.includes("duplicate key value") || message.includes("unique constraint")) {
    return "Já existe uma marca com esse nome.";
  }
  return `Falha ao salvar marca: ${message}`;
}

export async function createBrandAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome da marca." };

  const logo = formData.get("logo");
  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;

  const supabase = await createServerSupabaseClient();

  let logoUrl: string | null = null;
  if (logoFile) {
    try {
      logoUrl = await uploadLogo(supabase, logoFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao enviar logo.";
      return { error: message };
    }
  }

  const { error } = await supabase.from("brands").insert({ name, logo_url: logoUrl });
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}

export async function updateBrandAction(
  id: string,
  currentLogoUrl: string | null,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome da marca." };

  const logo = formData.get("logo");
  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;

  const supabase = await createServerSupabaseClient();

  let logoUrl = currentLogoUrl;
  if (logoFile) {
    try {
      logoUrl = await uploadLogo(supabase, logoFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao enviar logo.";
      return { error: message };
    }
  }

  const { error } = await supabase.from("brands").update({ name, logo_url: logoUrl }).eq("id", id);
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}

export async function deleteBrandAction(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createServerSupabaseClient();

  const { count, error: countError } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id);

  if (countError) return { error: `Falha ao verificar uso da marca: ${countError.message}` };
  if (count && count > 0) {
    return { error: `Marca em uso por ${count} veículo(s), remova o vínculo antes de excluir.` };
  }

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { error: `Falha ao excluir marca: ${error.message}` };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}
```

Note: the test mocks `select` on the `vehicles` table as `select: () => ({ eq: () => Promise.resolve({ count, error }) })`, which matches calling `.select(...).eq(...)` and awaiting the result directly — this mirrors how the real Supabase client resolves a promise at the end of the chain.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run app/admin/marcas/actions.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add app/admin/marcas/actions.ts app/admin/marcas/actions.test.ts
git commit -m "feat: add brand CRUD server actions"
```

---

## Task 4: Brand CRUD pages (list, create, edit)

**Files:**
- Create: `app/admin/marcas/page.tsx`
- Create: `app/admin/marcas/BrandForm.tsx`
- Create: `app/admin/marcas/nova/page.tsx`
- Create: `app/admin/marcas/[id]/editar/page.tsx`
- Create: `app/admin/marcas/[id]/editar/EditarMarcaForm.tsx`
- Modify: `components/EmployeeBar.tsx`

**Interfaces:**
- Consumes: `getBrands`, `getBrandById`, `Brand` from `@/lib/brands` (Task 2); `createBrandAction`, `updateBrandAction`, `deleteBrandAction` from `./actions` (Task 3); `requireUser` from `@/lib/auth`.
- Produces: routes `/admin/marcas`, `/admin/marcas/nova`, `/admin/marcas/[id]/editar`; a reusable `BrandForm` client component: `BrandForm({ action, brand, pending, error }: { action: (formData: FormData) => void; brand?: Brand; pending: boolean; error: string | null })`.

This task has no automated tests (it's UI composed of already-tested actions/data functions) — verify manually per Step-by-step below.

- [ ] **Step 1: Create the shared `BrandForm` component**

```tsx
// app/admin/marcas/BrandForm.tsx
"use client";

import type { Brand } from "@/lib/brands";

type Props = {
  action: (formData: FormData) => void;
  brand?: Brand;
  pending: boolean;
  error: string | null;
};

export default function BrandForm({ action, brand, pending, error }: Props) {
  return (
    <form action={action} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
        <input
          name="name"
          defaultValue={brand?.name}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Logo {brand?.logoUrl ? "(deixe em branco para manter a atual)" : "(opcional)"}
        </label>
        {brand?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoUrl} alt={brand.name} className="w-16 h-16 object-contain mb-2 border border-gray-200 rounded" />
        )}
        <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 bg-brand-red text-white font-semibold rounded-lg disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create the list page**

```tsx
// app/admin/marcas/page.tsx
import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { getBrands } from "@/lib/brands";
import { deleteBrandAction } from "./actions";

export default async function MarcasPage() {
  await requireUser();
  const brands = await getBrands();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Marcas</h1>
        <Link href="/admin/marcas/nova" className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm">
          Nova marca
        </Link>
      </div>

      {brands.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma marca cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {brands.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                {b.logoUrl ? (
                  <Image src={b.logoUrl} alt={b.name} width={32} height={32} className="object-contain" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gray-100" />
                )}
                <span className="font-semibold text-brand-black">{b.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/marcas/${b.id}/editar`} className="text-sm text-brand-red font-semibold hover:underline">
                  Editar
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteBrandAction(b.id);
                  }}
                >
                  <button type="submit" className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                    Excluir
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create the "new brand" page**

```tsx
// app/admin/marcas/nova/page.tsx
"use client";

import { useActionState } from "react";
import { createBrandAction } from "../actions";
import BrandForm from "../BrandForm";

type State = { error: string | null };

export default function NovaMarcaPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createBrandAction(formData),
    { error: null }
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar marca</h1>
      <BrandForm action={formAction} pending={pending} error={state.error} />
    </div>
  );
}
```

- [ ] **Step 4: Create the "edit brand" page and its client form**

```tsx
// app/admin/marcas/[id]/editar/page.tsx
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getBrandById } from "@/lib/brands";
import EditarMarcaForm from "./EditarMarcaForm";

export default async function EditarMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const brand = await getBrandById(id);
  if (!brand) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Editar marca</h1>
      <EditarMarcaForm brand={brand} />
    </div>
  );
}
```

```tsx
// app/admin/marcas/[id]/editar/EditarMarcaForm.tsx
"use client";

import { useActionState } from "react";
import { updateBrandAction } from "../../actions";
import BrandForm from "../../BrandForm";
import type { Brand } from "@/lib/brands";

type State = { error: string | null };

export default function EditarMarcaForm({ brand }: { brand: Brand }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateBrandAction(brand.id, brand.logoUrl, formData),
    { error: null }
  );

  return <BrandForm action={formAction} brand={brand} pending={pending} error={state.error} />;
}
```

- [ ] **Step 5: Add a navigation link from `EmployeeBar`**

In `components/EmployeeBar.tsx`, add a link next to "Gerenciar usuários":

```tsx
<Link
  href="/admin/marcas"
  className="text-sm font-semibold text-white border border-brand-gold/40 px-4 py-2 rounded hover:bg-brand-black-soft transition-colors"
>
  Gerenciar marcas
</Link>
```

Insert it directly after the existing `/admin/usuarios` `Link` block (before the `logoutAction` form).

- [ ] **Step 6: Verify manually**

Run `npm run dev`, log in, open `/admin/marcas`: confirm the empty list renders, "Nova marca" creates a brand with and without a logo, editing changes the name/logo, and deleting a brand not in use succeeds while deleting one referenced by a vehicle (once Task 6+ wires up `brand_id`) is blocked with the friendly message.

- [ ] **Step 7: Commit**

```bash
git add app/admin/marcas components/EmployeeBar.tsx
git commit -m "feat: add brand CRUD pages"
```

---

## Task 5: Update `Vehicle` type and `filterVehicles` for `brand`/`brandId`

**Files:**
- Modify: `lib/vehicles.ts`
- Modify: `lib/vehicles.test.ts`

**Interfaces:**
- Consumes: `Brand` type from `@/lib/brands` (Task 2).
- Produces:
  - `type Vehicle = { id: string; brand: Brand | null; model: string; year: number; price: number; km: number; transmission: "manual" | "automatic"; fuel: string; color: string; images: string[]; description: string }`
  - `type VehicleFilters = { brandId?: string; model?: string; minYear?: number; maxYear?: number; minPrice?: number; maxPrice?: number; maxKm?: number; transmission?: "manual" | "automatic"; fuel?: string; color?: string }`
  - `filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[]` — same behavior, now matching `vehicle.brand?.id === filters.brandId`.

- [ ] **Step 1: Update the failing/changed tests first**

Replace the contents of `lib/vehicles.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { filterVehicles, type Vehicle } from "./vehicles";

const toyota = { id: "b1", name: "Toyota", logoUrl: null };
const honda = { id: "b2", name: "Honda", logoUrl: null };

const sample: Vehicle[] = [
  {
    id: "1", brand: toyota, model: "Corolla", year: 2020, price: 90000,
    km: 40000, transmission: "automatic", fuel: "Flex", color: "Prata",
    images: [], description: "",
  },
  {
    id: "2", brand: honda, model: "Civic", year: 2018, price: 75000,
    km: 60000, transmission: "manual", fuel: "Flex", color: "Preto",
    images: [], description: "",
  },
  {
    id: "3", brand: toyota, model: "Hilux", year: 2022, price: 220000,
    km: 15000, transmission: "automatic", fuel: "Diesel", color: "Branco",
    images: [], description: "",
  },
  {
    id: "4", brand: null, model: "Modelo sem marca", year: 2015, price: 30000,
    km: 100000, transmission: "manual", fuel: "Flex", color: "Cinza",
    images: [], description: "",
  },
];

describe("filterVehicles", () => {
  it("returns all vehicles when no filters are given", () => {
    expect(filterVehicles(sample, {})).toHaveLength(4);
  });

  it("filters by brandId", () => {
    const result = filterVehicles(sample, { brandId: "b1" });
    expect(result.map((v) => v.id)).toEqual(["1", "3"]);
  });

  it("excludes vehicles without a brand when filtering by brandId", () => {
    const result = filterVehicles(sample, { brandId: "b2" });
    expect(result.map((v) => v.id)).toEqual(["2"]);
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
    expect(result.map((v) => v.id)).toEqual(["2", "4"]);
  });

  it("combines multiple filters", () => {
    const result = filterVehicles(sample, { brandId: "b1", transmission: "automatic", minYear: 2021 });
    expect(result.map((v) => v.id)).toEqual(["3"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/vehicles.test.ts`
Expected: FAIL — type errors / `filters.brand` no longer matches, `brandId` filter not implemented.

- [ ] **Step 3: Update the implementation**

Replace the contents of `lib/vehicles.ts`:

```typescript
import type { Brand } from "./brands";

export type Vehicle = {
  id: string;
  brand: Brand | null;
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
  brandId?: string;
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
    if (filters.brandId && v.brand?.id !== filters.brandId) return false;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/vehicles.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/vehicles.ts lib/vehicles.test.ts
git commit -m "feat: replace vehicle brand string with linked Brand entity"
```

---

## Task 6: Update `lib/vehicles-data.ts` to join brand

**Files:**
- Modify: `lib/vehicles-data.ts`

**Interfaces:**
- Consumes: `Vehicle` (Task 5, now with `brand: Brand | null`).
- Produces: `getVehicles(): Promise<Vehicle[]>` and `getVehicleById(id): Promise<Vehicle | null>` unchanged signatures, now returning the joined brand.

No new automated test here (this file has no existing tests, matching the codebase's current pattern of leaving thin Supabase-query wrappers untested — see `lib/brands.ts` in Task 2 for the one place a Supabase wrapper is tested, kept because it's newly introduced logic). Verify manually per Step 3.

- [ ] **Step 1: Replace the row type and mapping**

```typescript
// lib/vehicles-data.ts
import { createServerSupabaseClient } from "./supabase/server";
import type { Vehicle } from "./vehicles";

type VehicleRow = {
  id: string;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: "manual" | "automatic";
  fuel: string;
  color: string;
  images: string[];
  description: string;
  brand: { id: string; name: string; logo_url: string | null } | null;
};

function toVehicle(row: VehicleRow): Vehicle {
  const { brand, ...rest } = row;
  return {
    ...rest,
    brand: brand ? { id: brand.id, name: brand.name, logoUrl: brand.logo_url } : null,
  };
}

const SELECT_WITH_BRAND = "*, brand:brands(id, name, logo_url)";

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_BRAND)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Falha ao carregar estoque: ${error.message}`);
    return [];
  }
  return (data as unknown as VehicleRow[]).map(toVehicle);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_BRAND)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar veículo: ${error.message}`);
  return data ? toVehicle(data as unknown as VehicleRow) : null;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors from this file (other files may still fail until later tasks are done — that's expected mid-plan; the full check happens in Task 9).

- [ ] **Step 3: Verify manually**

Once Task 7-8 are done and at least one vehicle has a `brand_id` set, load `/estoque` and confirm the vehicle shows the linked brand's name.

- [ ] **Step 4: Commit**

```bash
git add lib/vehicles-data.ts
git commit -m "feat: join brand data when loading vehicles"
```

---

## Task 7: Update vehicle server actions for `brand_id`

**Files:**
- Modify: `app/estoque/actions.ts`
- Modify: `app/estoque/actions.test.ts`

**Interfaces:**
- Produces: `parseVehicleFields` returns `{ brand_id: string | null, model, year, price, km, transmission, fuel, color, description }` instead of `{ brand, ... }`; `validateVehicleFields` no longer requires `brand` to be non-empty (brand is optional, per the spec's nullable `brand_id`).

- [ ] **Step 1: Update the failing tests first**

In `app/estoque/actions.test.ts`, replace `fd.set("brand", "Toyota");` in `baseFormData()` with `fd.set("brand_id", "b1");`, and add a new test:

```typescript
describe("createVehicleAction field parsing", () => {
  it("saves brand_id as null when no brand is selected", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const singleMock = vi.fn().mockResolvedValue({ data: { id: "v1" }, error: null });
    const selectMock = vi.fn(() => ({ single: singleMock }));
    const insertMock = vi.fn(() => ({ select: selectMock }));
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("vehicles");
      return { insert: insertMock };
    });

    const { createVehicleAction } = await import("./actions");
    const fd = baseFormData();
    fd.set("brand_id", "");

    await createVehicleAction(fd);

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ brand_id: null }),
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run app/estoque/actions.test.ts`
Expected: FAIL — existing tests fail because `validateVehicleFields` still requires `brand`, and the new test finds no `brand_id: null` handling.

- [ ] **Step 3: Update the implementation**

In `app/estoque/actions.ts`, replace `parseVehicleFields` and `validateVehicleFields`:

```typescript
function parseVehicleFields(formData: FormData) {
  const brandId = String(formData.get("brand_id") ?? "").trim();
  return {
    brand_id: brandId || null,
    model: String(formData.get("model") ?? "").trim(),
    year: Number(formData.get("year")),
    price: Number(formData.get("price")),
    km: Number(formData.get("km")),
    transmission: String(formData.get("transmission") ?? ""),
    fuel: String(formData.get("fuel") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };
}

function validateVehicleFields(
  fields: ReturnType<typeof parseVehicleFields>
): string | null {
  if (!fields.model || !fields.fuel || !fields.color) {
    return "Preencha todos os campos obrigatórios.";
  }
  if (!Number.isFinite(fields.year) || fields.year < 1900) {
    return "Ano inválido.";
  }
  if (!Number.isFinite(fields.price) || fields.price < 0) {
    return "Preço inválido.";
  }
  if (!Number.isFinite(fields.km) || fields.km < 0) {
    return "Quilometragem inválida.";
  }
  if (fields.transmission !== "manual" && fields.transmission !== "automatic") {
    return "Câmbio inválido.";
  }
  return null;
}
```

No other changes are needed in this file — `fields` is spread as-is into `insert`/`update` calls, so `brand_id` flows through automatically.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run app/estoque/actions.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add app/estoque/actions.ts app/estoque/actions.test.ts
git commit -m "feat: switch vehicle actions from brand text to brand_id"
```

---

## Task 8: Update `VehicleForm` to select a brand, and wire up its callers

**Files:**
- Modify: `components/VehicleForm.tsx`
- Modify: `app/estoque/novo/page.tsx`
- Modify: `app/estoque/[id]/editar/page.tsx`

**Interfaces:**
- Consumes: `Brand` from `@/lib/brands`, `getBrands` from `@/lib/brands`.
- Produces: `VehicleForm({ action, vehicle, brands, existingPhotoCount, pending, error }: { action: (formData: FormData) => void; vehicle?: Vehicle; brands: Brand[]; existingPhotoCount?: number; pending: boolean; error: string | null })`.

No new automated test (this is presentational wiring on top of already-tested actions); verify manually per Step 4.

- [ ] **Step 1: Update `VehicleForm.tsx`**

Replace the `Props` type and the brand field:

```tsx
import type { Brand } from "@/lib/brands";

type Props = {
  action: (formData: FormData) => void;
  vehicle?: Vehicle;
  brands: Brand[];
  existingPhotoCount?: number;
  pending: boolean;
  error: string | null;
};

export default function VehicleForm({ action, vehicle, brands, existingPhotoCount = 0, pending, error }: Props) {
```

Replace the brand `<input>` block with:

```tsx
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">Marca</label>
  <select name="brand_id" defaultValue={vehicle?.brand?.id ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
    <option value="">Selecione uma marca</option>
    {brands.map((b) => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ))}
  </select>
</div>
```

- [ ] **Step 2: Wire up `app/estoque/novo/page.tsx`**

This page is currently a client component with no server-side data fetching, so it needs to become a server component that fetches brands and passes them to a client subcomponent. Rename the existing default export's body into a new client component and add a server wrapper:

```tsx
// app/estoque/novo/NovoVeiculoForm.tsx
"use client";

import { useActionState } from "react";
import { createVehicleAction } from "../actions";
import VehicleForm from "@/components/VehicleForm";
import type { Brand } from "@/lib/brands";

type State = { error: string | null };

export default function NovoVeiculoForm({ brands }: { brands: Brand[] }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createVehicleAction(formData),
    { error: null }
  );

  return <VehicleForm action={formAction} brands={brands} pending={pending} error={state.error} />;
}
```

```tsx
// app/estoque/novo/page.tsx
import { requireUser } from "@/lib/auth";
import { getBrands } from "@/lib/brands";
import NovoVeiculoForm from "./NovoVeiculoForm";

export default async function NovoVeiculoPage() {
  await requireUser();
  const brands = await getBrands();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar veículo</h1>
      <NovoVeiculoForm brands={brands} />
    </div>
  );
}
```

- [ ] **Step 3: Wire up `app/estoque/[id]/editar/page.tsx` and `EditarVeiculoForm.tsx`**

In `app/estoque/[id]/editar/page.tsx`, fetch brands alongside the vehicle and pass them down:

```tsx
import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/vehicles-data";
import { getBrands } from "@/lib/brands";
import { requireUser } from "@/lib/auth";
import EditarVeiculoForm from "./EditarVeiculoForm";

export default async function EditarVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const [vehicle, brands] = await Promise.all([getVehicleById(id), getBrands()]);
  if (!vehicle) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Editar veículo</h1>
      <EditarVeiculoForm vehicle={vehicle} brands={brands} />
    </div>
  );
}
```

In `app/estoque/[id]/editar/EditarVeiculoForm.tsx`, accept and forward `brands`:

```tsx
import type { Brand } from "@/lib/brands";

export default function EditarVeiculoForm({ vehicle, brands }: { vehicle: Vehicle; brands: Brand[] }) {
  // ... unchanged useActionState/delete logic ...
  return (
    <>
      <VehicleForm
        action={formAction}
        vehicle={vehicle}
        brands={brands}
        existingPhotoCount={vehicle.images.length}
        pending={pending}
        error={state.error}
      />
      {/* ... unchanged delete form ... */}
    </>
  );
}
```

- [ ] **Step 4: Verify manually**

Run `npm run dev`. On `/estoque/novo`, confirm the brand `<select>` lists brands created in Task 4 and saving without selecting one succeeds (brand stays unset). On `/estoque/[id]/editar` for an existing vehicle, confirm the current brand (or "Selecione uma marca" if none) is preselected and can be changed.

- [ ] **Step 5: Commit**

```bash
git add components/VehicleForm.tsx app/estoque/novo app/estoque/[id]/editar
git commit -m "feat: select vehicle brand from a dropdown instead of free text"
```

---

## Task 9: Update brand display across vehicle UI (card, detail, filters, WhatsApp message)

**Files:**
- Modify: `components/VehicleCard.tsx`
- Modify: `components/EstoqueFilters.tsx`
- Modify: `app/estoque/[id]/page.tsx`
- Modify: `components/WhatsAppButton.tsx`

**Interfaces:**
- Consumes: `Vehicle.brand: Brand | null` (Task 5); `VehicleFilters.brandId` (Task 5).

No new automated tests (presentational, driven by the already-tested `filterVehicles`); verify manually per the last step.

- [ ] **Step 1: Update `VehicleCard.tsx`**

Replace every `vehicle.brand` string usage:

```tsx
alt={`${vehicle.brand?.name ?? ""} ${vehicle.model}`.trim()}
```

```tsx
<p className="text-brand-black font-bold text-lg">
  {vehicle.brand?.name ? `${vehicle.brand.name} ` : ""}{vehicle.model}
</p>
```

- [ ] **Step 2: Update `components/WhatsAppButton.tsx`**

```tsx
`Olá! Tenho interesse no ${vehicle.brand?.name ? vehicle.brand.name + " " : ""}${vehicle.model} ${vehicle.year} anunciado no site da VS Motors.`
```

- [ ] **Step 3: Update `app/estoque/[id]/page.tsx`**

```tsx
alt={`${vehicle.brand?.name ?? ""} ${vehicle.model}`.trim()}
```

```tsx
<h1 className="text-3xl font-bold text-white">
  {vehicle.brand?.name ? `${vehicle.brand.name} ` : ""}{vehicle.model} {vehicle.year}
</h1>
```

- [ ] **Step 4: Update `components/EstoqueFilters.tsx`**

Replace the brand derivation and every filter reference from brand-as-string to brand-as-object, keyed by id:

```tsx
const brandOptions = Array.from(
  new Map(
    vehicles
      .filter((v) => v.brand)
      .map((v) => [v.brand!.id, v.brand!])
  ).values()
).sort((a, b) => a.name.localeCompare(b.name));
```

Update `BrandCarousel` to take `{ id: string; name: string }[]` instead of `string[]`, and select by id:

```tsx
function BrandCarousel({
  brands,
  activeBrandId,
  onSelect,
}: {
  brands: { id: string; name: string }[];
  activeBrandId: string | undefined;
  onSelect: (brandId: string | undefined) => void;
}) {
  // ... same layout, replace `brands.map((b) => (...))` body:
  {brands.map((b) => (
    <button
      key={b.id}
      onClick={() => onSelect(b.id)}
      className={`shrink-0 w-24 flex flex-col items-center gap-2 px-3 py-3 rounded-lg border transition-colors ${
        activeBrandId === b.id ? "border-brand-red bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${activeBrandId === b.id ? "bg-brand-red text-white" : "bg-gray-100 text-gray-500"}`}>
        {b.name.charAt(0)}
      </span>
      <span className={`text-xs font-medium truncate w-full text-center ${activeBrandId === b.id ? "text-brand-black" : "text-gray-600"}`}>{b.name}</span>
    </button>
  ))}
  // ...
}
```

Delete the old `const brands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();` line (replaced by `brandOptions` above — `models`, `fuels`, `colors` stay exactly as they are). Update the "Marca" `FilterGroup` and the `BrandCarousel` call site:

```tsx
<FilterGroup title="Marca">
  <RadioOption
    name="brand"
    checked={!filters.brandId}
    onChange={() => update("brandId", undefined)}
    label="Todas"
    count={countBy("brandId", undefined, { ...filters, brandId: undefined })}
  />
  {brandOptions.map((b) => (
    <RadioOption
      key={b.id}
      name="brand"
      checked={filters.brandId === b.id}
      onChange={() => update("brandId", b.id)}
      label={b.name}
      count={countBy("brandId", b.id, { ...filters, brandId: undefined })}
    />
  ))}
</FilterGroup>
```

```tsx
<BrandCarousel brands={brandOptions} activeBrandId={filters.brandId} onSelect={(id) => update("brandId", id)} />
```

Update the text search to use the brand name safely:

```tsx
return base.filter((v) => `${v.brand?.name ?? ""} ${v.model}`.toLowerCase().includes(q));
```

- [ ] **Step 5: Run the full test suite**

Run: `npx vitest run`
Expected: all tests PASS (`lib/vehicles.test.ts`, `lib/brands.test.ts`, `app/estoque/actions.test.ts`, `app/admin/marcas/actions.test.ts`).

- [ ] **Step 6: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Verify manually**

Run `npm run dev`. On `/estoque`: confirm the brand carousel and "Marca" filter list the brands from vehicles that have one linked, filtering narrows results correctly, and a vehicle with no linked brand still renders its card/detail without crashing (shows just the model name).

- [ ] **Step 8: Commit**

```bash
git add components/VehicleCard.tsx components/EstoqueFilters.tsx components/WhatsAppButton.tsx app/estoque/[id]/page.tsx
git commit -m "feat: display linked brand name/logo across vehicle UI"
```

---

## Task 10: End-to-end manual verification

**Files:** none (verification only).

- [ ] **Step 1: Full flow check**

With `npm run dev` running and logged in as an employee:
1. Create two brands under `/admin/marcas`, one with a logo and one without.
2. Create a vehicle under `/estoque/novo`, selecting the brand with a logo.
3. Confirm `/estoque` shows the vehicle under that brand in the carousel/filter, and the card shows the brand name.
4. Edit the vehicle to switch to the other brand; confirm the change reflects everywhere.
5. Try deleting the brand currently linked to that vehicle from `/admin/marcas`: confirm it's blocked with the "Marca em uso" message.
6. Unlink the vehicle (edit it, choose "Selecione uma marca"), then delete the brand: confirm it now succeeds.
7. Log out and confirm `/admin/marcas`, `/admin/marcas/nova` redirect to `/login`.

- [ ] **Step 2: Run the full automated suite one last time**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all green.

No commit for this task — it's verification only.
