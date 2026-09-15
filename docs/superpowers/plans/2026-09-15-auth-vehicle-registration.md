# Login de Funcionários e Cadastro de Veículos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let logged-in employees (closed account creation, no public signup) manage the vehicle stock — create, edit, delete vehicles with up to 14 uploaded photos each — while the public site stays open, using Supabase for auth, database, and file storage.

**Architecture:** Next.js stays the app (deployed to Vercel). Supabase provides Postgres (`vehicles` table replaces the hardcoded array in `lib/vehicles.ts`), Auth (email/password, session cookie), and Storage (vehicle photos). Route protection happens in two layers: `proxy.ts` redirects unauthenticated visitors away from admin routes, and every Server Action re-checks the session itself (proxy alone is not a security boundary per Next.js's own guidance).

**Tech Stack:** Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, `@supabase/supabase-js`, `@supabase/ssr`, TypeScript, Vitest.

**Spec:** [docs/superpowers/specs/2026-09-15-auth-vehicle-registration-design.md](../specs/2026-09-15-auth-vehicle-registration-design.md)

## Global Constraints

- No public account-creation UI anywhere. Accounts are created only through the internal "gerenciar usuários" screen or the Supabase dashboard.
- Every Server Action that mutates data must verify the caller has a valid session itself — never rely solely on `proxy.ts`.
- Max 14 photos per vehicle; accepted types `jpg`, `png`, `webp`; max 5MB per photo.
- No 2FA. No role differentiation — any authenticated user can create/edit/delete any vehicle.
- Public pages (`/`, `/estoque`, `/estoque/[id]`, `/sobre`, `/contato`, `/venda-seu-carro`) stay accessible without login.
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is only ever read in server-only files and must never be imported by a Client Component.
- `middleware.ts` is deprecated in this Next.js version — route protection goes in `proxy.ts` using `export function proxy(request)`.

---

## Task 0: Supabase project setup (manual, one-time)

This task has no code — it creates the external resources later tasks depend on. Do this before Task 1.

- [ ] **Step 1: Create the Supabase project**

Go to https://supabase.com, create a free project (any name/region), and wait for it to finish provisioning.

- [ ] **Step 2: Create the `vehicles` table**

In the Supabase dashboard, open the SQL Editor and run:

```sql
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year integer not null,
  price numeric not null,
  km integer not null,
  transmission text not null check (transmission in ('manual', 'automatic')),
  fuel text not null,
  color text not null,
  images text[] not null default '{}',
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table vehicles enable row level security;

create policy "public can read vehicles"
  on vehicles for select
  using (true);

create policy "authenticated users can insert vehicles"
  on vehicles for insert
  to authenticated
  with check (true);

create policy "authenticated users can update vehicles"
  on vehicles for update
  to authenticated
  using (true);

create policy "authenticated users can delete vehicles"
  on vehicles for delete
  to authenticated
  using (true);
```

- [ ] **Step 3: Create the photo storage bucket**

In the dashboard, go to Storage → create a new **public** bucket named `vehicle-photos`.

- [ ] **Step 4: Disable public signups**

In Authentication → Providers → Email, make sure "Allow new users to sign up" is turned **off**. This is the setting that guarantees nobody outside the app can create an account, since the app itself never exposes a signup form.

- [ ] **Step 5: Create the first employee account**

In Authentication → Users, click "Add user" → "Create new user", enter the owner's email and a password. This will be the first account able to log in and, once Task 7 is done, create the rest.

- [ ] **Step 6: Collect the project keys**

In Project Settings → API, note down:
- `Project URL`
- `anon public` key
- `service_role` key (keep this one secret — never commit it, never send it to the browser)

Keep these for Task 1.

---

## Task 1: Install dependencies and Supabase server clients

**Files:**
- Modify: `package.json` (dependencies)
- Create: `.env.local.example`
- Create: `.env.local` (not committed — add to `.gitignore` if not already ignored)
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Test: `lib/supabase/server.test.ts`

**Interfaces:**
- Produces: `createServerSupabaseClient(): Promise<SupabaseClient>` from `lib/supabase/server.ts` — used by every Server Component/Action that reads/writes as the logged-in user.
- Produces: `createAdminSupabaseClient(): SupabaseClient` from `lib/supabase/admin.ts` — used only by `app/admin/usuarios/actions.ts` (Task 7) to create/reset employee accounts.

- [ ] **Step 1: Install packages**

Run: `npm install @supabase/supabase-js @supabase/ssr`

- [ ] **Step 2: Check `.gitignore` covers `.env.local`**

Run: `cat .gitignore | grep env` (Bash) or `Select-String env .gitignore` (PowerShell). If nothing matches, add a line `.env.local` to `.gitignore`.

- [ ] **Step 3: Create the env example file**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 4: Create `.env.local` with the real values from Task 0, Step 6**

Create `.env.local` (same three lines, filled with the real project URL and keys). This file is only for local development — Vercel gets these values set separately in its project settings when deploying.

- [ ] **Step 6: Write the failing test for the server client factory**

Create `lib/supabase/server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("createServerSupabaseClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  it("builds a client without throwing when env vars are present", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      getAll: () => [],
      set: () => {},
    } as never);

    const { createServerSupabaseClient } = await import("./server");
    await expect(createServerSupabaseClient()).resolves.toBeDefined();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run lib/supabase/server.test.ts`
Expected: FAIL — `lib/supabase/server.ts` does not exist yet.

- [ ] **Step 8: Implement the server client factory**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can be called from a Server Component during render,
            // where cookies can't be written. Session refresh in proxy.ts
            // (Task 2) covers that case, so this is safe to ignore.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 9: Implement the admin client factory**

Create `lib/supabase/admin.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npx vitest run lib/supabase/server.test.ts`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json .env.local.example .gitignore lib/supabase/server.ts lib/supabase/admin.ts lib/supabase/server.test.ts
git commit -m "feat: add Supabase server and admin client factories"
```

---

## Task 2: Auth helpers and route protection (`proxy.ts`)

**Files:**
- Create: `lib/auth.ts`
- Create: `lib/auth.test.ts`
- Create: `lib/auth-errors.ts`
- Create: `lib/auth-errors.test.ts`
- Create: `proxy.ts`

**Interfaces:**
- Consumes: `createServerSupabaseClient()` from `lib/supabase/server.ts` (Task 1).
- Produces: `requireUser(): Promise<User>` from `lib/auth.ts` — every mutating Server Action (Tasks 5, 6, 7) calls this first and lets it throw/redirect on missing session.
- Produces: `getSessionUser(): Promise<User | null>` from `lib/auth.ts` — used by pages that render differently when logged in.
- Produces: `mapAuthError(message: string | undefined): string` from `lib/auth-errors.ts` — used by the login action (Task 3) to turn Supabase error messages into the Portuguese copy defined in the spec.

- [ ] **Step 1: Write the failing test for `mapAuthError`**

Create `lib/auth-errors.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mapAuthError } from "./auth-errors";

describe("mapAuthError", () => {
  it("returns a generic message for invalid credentials, without revealing whether the email exists", () => {
    expect(mapAuthError("Invalid login credentials")).toBe(
      "E-mail ou senha incorretos."
    );
  });

  it("returns a rate-limit message when Supabase reports too many requests", () => {
    expect(mapAuthError("Email rate limit exceeded")).toBe(
      "Muitas tentativas. Aguarde alguns minutos e tente novamente."
    );
    expect(mapAuthError("Request rate limit reached")).toBe(
      "Muitas tentativas. Aguarde alguns minutos e tente novamente."
    );
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(mapAuthError("Something exploded")).toBe(
      "Não foi possível entrar. Tente novamente."
    );
  });

  it("falls back to a generic message when there is no error text", () => {
    expect(mapAuthError(undefined)).toBe("Não foi possível entrar. Tente novamente.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth-errors.test.ts`
Expected: FAIL — `lib/auth-errors.ts` does not exist yet.

- [ ] **Step 3: Implement `mapAuthError`**

Create `lib/auth-errors.ts`:

```ts
export function mapAuthError(message: string | undefined): string {
  if (!message) return "Não foi possível entrar. Tente novamente.";

  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  return "Não foi possível entrar. Tente novamente.";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth-errors.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing test for `getSessionUser` and `requireUser`**

Create `lib/auth.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";

const getUserMock = vi.fn();

vi.mock("./supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: getUserMock },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

describe("getSessionUser", () => {
  it("returns the user when a session exists", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
    const { getSessionUser } = await import("./auth");
    expect(await getSessionUser()).toEqual({ id: "u1" });
  });

  it("returns null when there is no session", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const { getSessionUser } = await import("./auth");
    expect(await getSessionUser()).toBeNull();
  });
});

describe("requireUser", () => {
  it("returns the user when a session exists", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
    const { requireUser } = await import("./auth");
    expect(await requireUser()).toEqual({ id: "u1" });
  });

  it("redirects to /login when there is no session", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const { requireUser } = await import("./auth");
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run lib/auth.test.ts`
Expected: FAIL — `lib/auth.ts` does not exist yet.

- [ ] **Step 7: Implement `lib/auth.ts`**

Create `lib/auth.ts`:

```ts
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run lib/auth.test.ts lib/auth-errors.test.ts`
Expected: PASS

- [ ] **Step 9: Implement `proxy.ts`**

Create `proxy.ts` (project root, same level as `app/`):

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/estoque/novo", "/admin"];

function isProtected(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  // /estoque/[id]/editar, but not /estoque/[id] itself.
  return /^\/estoque\/[^/]+\/editar/.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/estoque/:path*", "/admin/:path*"],
};
```

- [ ] **Step 10: Commit**

```bash
git add lib/auth.ts lib/auth.test.ts lib/auth-errors.ts lib/auth-errors.test.ts proxy.ts
git commit -m "feat: add session helpers and proxy-based route protection"
```

---

## Task 3: Login page and actions

**Files:**
- Create: `app/login/actions.ts`
- Create: `app/login/page.tsx`
- Test: `app/login/actions.test.ts`

**Interfaces:**
- Consumes: `createServerSupabaseClient()` (Task 1), `mapAuthError()` (Task 2).
- Produces: `loginAction(prevState: LoginState, formData: FormData): Promise<LoginState>` where `LoginState = { error: string | null }` — bound to the login `<form>`'s `action`.
- Produces: `logoutAction(): Promise<void>` — used by the "Sair" button added to admin pages in Tasks 5 and 7.

- [ ] **Step 1: Write the failing test for `loginAction`**

Create `app/login/actions.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";

const signInMock = vi.fn();
const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { signInWithPassword: signInMock },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("loginAction", () => {
  it("redirects to /estoque on successful login", async () => {
    signInMock.mockResolvedValueOnce({ error: null });
    const { loginAction } = await import("./actions");

    const formData = new FormData();
    formData.set("email", "func@vsmotors.com.br");
    formData.set("password", "correct-horse");

    await expect(loginAction({ error: null }, formData)).rejects.toThrow(
      "REDIRECT:/estoque"
    );
  });

  it("returns a mapped error message on invalid credentials", async () => {
    signInMock.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    const { loginAction } = await import("./actions");

    const formData = new FormData();
    formData.set("email", "func@vsmotors.com.br");
    formData.set("password", "wrong");

    const result = await loginAction({ error: null }, formData);
    expect(result).toEqual({ error: "E-mail ou senha incorretos." });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/login/actions.test.ts`
Expected: FAIL — `app/login/actions.ts` does not exist yet.

- [ ] **Step 3: Implement `app/login/actions.ts`**

Create `app/login/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/auth-errors";

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  redirect("/estoque");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/login/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Implement `app/login/page.tsx`**

Create `app/login/page.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Área do funcionário</h1>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-brand-red text-white font-semibold rounded-lg disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Add a discreet link to `/login` in the footer**

Modify `components/Footer.tsx` — inside the bottom bar `<div className="border-t border-white/10">`, change:

```tsx
<p className="text-center text-xs text-gray-500 py-5">
  © {new Date().getFullYear()} VS Motors. Todos os direitos reservados.
</p>
```

to:

```tsx
<div className="flex items-center justify-center gap-3 py-5">
  <p className="text-center text-xs text-gray-500">
    © {new Date().getFullYear()} VS Motors. Todos os direitos reservados.
  </p>
  <span className="text-gray-700">·</span>
  <a href="/login" className="text-xs text-gray-600 hover:text-gray-400">
    Área restrita
  </a>
</div>
```

- [ ] **Step 7: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/login`, log in with the employee account created in Task 0 Step 5. Expect a redirect to `/estoque`. Try a wrong password. Expect "E-mail ou senha incorretos." with no redirect.

- [ ] **Step 8: Commit**

```bash
git add app/login/actions.ts app/login/page.tsx app/login/actions.test.ts components/Footer.tsx
git commit -m "feat: add employee login page and session actions"
```

---

## Task 4: Photo validation helper

**Files:**
- Create: `lib/vehicle-photos.ts`
- Test: `lib/vehicle-photos.test.ts`

**Interfaces:**
- Produces: `validatePhotos(existingCount: number, incoming: { name: string; type: string; size: number }[]): { error: string | null }` — used by `app/estoque/actions.ts` (Task 6) before uploading anything to Supabase Storage.
- Produces: `MAX_PHOTOS_PER_VEHICLE = 14`, `MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024`, `ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]` — reused by Task 6 and by the client-side form in Task 5 for instant feedback.

- [ ] **Step 1: Write the failing tests**

Create `lib/vehicle-photos.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validatePhotos, MAX_PHOTOS_PER_VEHICLE } from "./vehicle-photos";

function file(name: string, type = "image/jpeg", size = 1024) {
  return { name, type, size };
}

describe("validatePhotos", () => {
  it("accepts a valid set of photos within the limit", () => {
    const result = validatePhotos(0, [file("a.jpg"), file("b.png", "image/png")]);
    expect(result).toEqual({ error: null });
  });

  it("rejects when total photos would exceed the limit", () => {
    const incoming = Array.from({ length: 5 }, (_, i) => file(`p${i}.jpg`));
    const result = validatePhotos(MAX_PHOTOS_PER_VEHICLE - 2, incoming);
    expect(result.error).toBe(`Máximo de ${MAX_PHOTOS_PER_VEHICLE} fotos por veículo.`);
  });

  it("rejects unsupported file types", () => {
    const result = validatePhotos(0, [file("doc.pdf", "application/pdf")]);
    expect(result.error).toBe("Formato de arquivo não suportado: doc.pdf.");
  });

  it("rejects files over the size limit", () => {
    const result = validatePhotos(0, [file("big.jpg", "image/jpeg", 6 * 1024 * 1024)]);
    expect(result.error).toBe("Arquivo muito grande: big.jpg (máximo 5MB).");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/vehicle-photos.test.ts`
Expected: FAIL — `lib/vehicle-photos.ts` does not exist yet.

- [ ] **Step 3: Implement `lib/vehicle-photos.ts`**

Create `lib/vehicle-photos.ts`:

```ts
export const MAX_PHOTOS_PER_VEHICLE = 14;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

type IncomingFile = { name: string; type: string; size: number };

export function validatePhotos(
  existingCount: number,
  incoming: IncomingFile[]
): { error: string | null } {
  if (existingCount + incoming.length > MAX_PHOTOS_PER_VEHICLE) {
    return { error: `Máximo de ${MAX_PHOTOS_PER_VEHICLE} fotos por veículo.` };
  }

  for (const f of incoming) {
    if (!ALLOWED_PHOTO_TYPES.includes(f.type)) {
      return { error: `Formato de arquivo não suportado: ${f.name}.` };
    }
    if (f.size > MAX_PHOTO_SIZE_BYTES) {
      return { error: `Arquivo muito grande: ${f.name} (máximo 5MB).` };
    }
  }

  return { error: null };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/vehicle-photos.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/vehicle-photos.ts lib/vehicle-photos.test.ts
git commit -m "feat: add vehicle photo validation helper"
```

---

## Task 5: Vehicle data layer + public pages read from Supabase

**Files:**
- Modify: `lib/vehicles.ts` (remove the hardcoded `vehicles` array, keep `Vehicle`, `VehicleFilters`, `filterVehicles`)
- Create: `lib/vehicles-data.ts`
- Create: `components/EstoqueFilters.tsx` (extracted from `app/estoque/page.tsx`)
- Modify: `app/estoque/page.tsx`
- Modify: `app/estoque/[id]/page.tsx`
- Test: `lib/vehicles.test.ts` (already exists — verify it still passes unchanged)

**Interfaces:**
- Consumes: `createServerSupabaseClient()` (Task 1).
- Produces: `getVehicles(): Promise<Vehicle[]>` and `getVehicleById(id: string): Promise<Vehicle | null>` from `lib/vehicles-data.ts` — used by `app/estoque/page.tsx`, `app/estoque/[id]/page.tsx`, and the edit page in Task 6.
- Produces: `<EstoqueFilters vehicles={Vehicle[]} />` — a Client Component holding all the filter/search UI that used to read the module-level `vehicles` constant.

- [ ] **Step 1: Trim `lib/vehicles.ts` down to types and the pure filter function**

Modify `lib/vehicles.ts` — delete the `export const vehicles: Vehicle[] = [...]` block (lines 44-81), keeping only the `Vehicle` type, `VehicleFilters` type, and `filterVehicles`.

- [ ] **Step 2: Run the existing test to confirm nothing broke**

Run: `npx vitest run lib/vehicles.test.ts`
Expected: PASS (this test already builds its own `sample` array and never imported the deleted constant).

- [ ] **Step 3: Implement `lib/vehicles-data.ts`**

Create `lib/vehicles-data.ts`:

```ts
import { createServerSupabaseClient } from "./supabase/server";
import type { Vehicle } from "./vehicles";

type VehicleRow = {
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

function toVehicle(row: VehicleRow): Vehicle {
  return { ...row };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao carregar estoque: ${error.message}`);
  return (data as VehicleRow[]).map(toVehicle);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar veículo: ${error.message}`);
  return data ? toVehicle(data as VehicleRow) : null;
}
```

- [ ] **Step 4: Extract the filter UI into `components/EstoqueFilters.tsx`**

Create `components/EstoqueFilters.tsx` with the exact contents currently in `app/estoque/page.tsx` (everything from `"use client"` through the closing of `EstoquePage`), with two changes:
1. Rename the default export from `EstoquePage` to `EstoqueFilters`.
2. Accept vehicles as a prop instead of importing the static array — change `import { vehicles, filterVehicles, ... } from "@/lib/vehicles";` to `import { filterVehicles, type VehicleFilters } from "@/lib/vehicles";` and `import type { Vehicle } from "@/lib/vehicles";`, then change the function signature from `export default function EstoquePage()` to `export default function EstoqueFilters({ vehicles }: { vehicles: Vehicle[] })`.

Everything else (the `brands`/`models`/`fuels`/`colors` derivations, `BrandCarousel`, `FilterGroup`, `RadioOption`, `countBy`, the JSX) stays byte-for-byte the same, since those already only reference the local `vehicles` value — they just now read it from the prop closure instead of the module-level constant.

- [ ] **Step 5: Replace `app/estoque/page.tsx` with a thin Server Component**

Modify `app/estoque/page.tsx` to:

```tsx
import { getVehicles } from "@/lib/vehicles-data";
import EstoqueFilters from "@/components/EstoqueFilters";

export default async function EstoquePage() {
  const vehicles = await getVehicles();
  return <EstoqueFilters vehicles={vehicles} />;
}
```

- [ ] **Step 6: Update `app/estoque/[id]/page.tsx` to read from Supabase**

Modify `app/estoque/[id]/page.tsx` — replace:

```tsx
import { vehicles } from "@/lib/vehicles";
```
with:
```tsx
import { getVehicleById } from "@/lib/vehicles-data";
```

and replace:

```tsx
  const { id } = await params;
  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) notFound();
```
with:
```tsx
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) notFound();
```

- [ ] **Step 7: Manual check**

With the Supabase table still empty, run `npm run dev` and visit `/estoque` — expect "Nenhum veículo encontrado" with no crash. Insert one test row directly via the Supabase dashboard's Table Editor, refresh, and confirm it renders in the grid and its detail page.

- [ ] **Step 8: Commit**

```bash
git add lib/vehicles.ts lib/vehicles-data.ts components/EstoqueFilters.tsx app/estoque/page.tsx "app/estoque/[id]/page.tsx"
git commit -m "feat: read vehicle stock from Supabase instead of a hardcoded array"
```

---

## Task 6: Create, edit, and delete vehicles (with photo upload)

**Files:**
- Create: `app/estoque/actions.ts`
- Create: `components/VehicleForm.tsx`
- Create: `app/estoque/novo/page.tsx`
- Create: `app/estoque/[id]/editar/page.tsx`
- Test: `app/estoque/actions.test.ts`

**Interfaces:**
- Consumes: `requireUser()` (Task 2), `validatePhotos()` + constants (Task 4), `createServerSupabaseClient()` (Task 1), `Vehicle` type (Task 5).
- Produces: `createVehicleAction(formData: FormData): Promise<{ error: string | null }>`, `updateVehicleAction(id: string, formData: FormData): Promise<{ error: string | null }>`, `deleteVehicleAction(id: string): Promise<{ error: string | null }>` from `app/estoque/actions.ts`.

- [ ] **Step 1: Write the failing tests for the actions' guard and validation behavior**

Create `app/estoque/actions.test.ts`:

```ts
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

function baseFormData() {
  const fd = new FormData();
  fd.set("brand", "Toyota");
  fd.set("model", "Corolla");
  fd.set("year", "2021");
  fd.set("price", "112000");
  fd.set("km", "32000");
  fd.set("transmission", "automatic");
  fd.set("fuel", "Flex");
  fd.set("color", "Prata");
  fd.set("description", "Completo.");
  return fd;
}

describe("createVehicleAction", () => {
  it("returns an error and never touches the database when there is no session", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("REDIRECT:/login"));
    const { createVehicleAction } = await import("./actions");

    await expect(createVehicleAction(baseFormData())).rejects.toThrow("REDIRECT:/login");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns an error when more than 14 photos are submitted", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const fd = baseFormData();
    for (let i = 0; i < 15; i++) {
      fd.append("photos", new File(["x"], `p${i}.jpg`, { type: "image/jpeg" }));
    }
    const { createVehicleAction } = await import("./actions");

    const result = await createVehicleAction(fd);
    expect(result).toEqual({ error: "Máximo de 14 fotos por veículo." });
    expect(fromMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/estoque/actions.test.ts`
Expected: FAIL — `app/estoque/actions.ts` does not exist yet.

- [ ] **Step 3: Implement `app/estoque/actions.ts`**

Create `app/estoque/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validatePhotos, MAX_PHOTOS_PER_VEHICLE } from "@/lib/vehicle-photos";

type ActionResult = { error: string | null };

function parseVehicleFields(formData: FormData) {
  return {
    brand: String(formData.get("brand") ?? "").trim(),
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
  if (!fields.brand || !fields.model || !fields.fuel || !fields.color) {
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

async function uploadPhotos(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  vehicleId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const path = `${vehicleId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("vehicle-photos").upload(path, file);
    if (error) throw new Error(`Falha ao enviar foto ${file.name}: ${error.message}`);
    const { data } = supabase.storage.from("vehicle-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export async function createVehicleAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const fields = parseVehicleFields(formData);
  const fieldError = validateVehicleFields(fields);
  if (fieldError) return { error: fieldError };

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const photoCheck = validatePhotos(0, photos.map((f) => ({ name: f.name, type: f.type, size: f.size })));
  if (photoCheck.error) return { error: photoCheck.error };

  const supabase = await createServerSupabaseClient();
  const { data: inserted, error: insertError } = await supabase
    .from("vehicles")
    .insert({ ...fields, images: [] })
    .select("id")
    .single();

  if (insertError) return { error: `Falha ao salvar veículo: ${insertError.message}` };

  const images = photos.length > 0 ? await uploadPhotos(supabase, inserted.id, photos) : [];
  if (images.length > 0) {
    const { error: updateError } = await supabase
      .from("vehicles")
      .update({ images })
      .eq("id", inserted.id);
    if (updateError) return { error: `Falha ao vincular fotos: ${updateError.message}` };
  }

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function updateVehicleAction(
  id: string,
  existingImages: string[],
  formData: FormData
): Promise<ActionResult> {
  await requireUser();

  const fields = parseVehicleFields(formData);
  const fieldError = validateVehicleFields(fields);
  if (fieldError) return { error: fieldError };

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const photoCheck = validatePhotos(existingImages.length, photos.map((f) => ({ name: f.name, type: f.type, size: f.size })));
  if (photoCheck.error) return { error: photoCheck.error };

  const supabase = await createServerSupabaseClient();
  const newImages = photos.length > 0 ? await uploadPhotos(supabase, id, photos) : [];

  const { error } = await supabase
    .from("vehicles")
    .update({ ...fields, images: [...existingImages, ...newImages] })
    .eq("id", id);

  if (error) return { error: `Falha ao atualizar veículo: ${error.message}` };

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${id}`);
  redirect(`/estoque/${id}`);
}

export async function deleteVehicleAction(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) return { error: `Falha ao excluir veículo: ${error.message}` };

  revalidatePath("/estoque");
  redirect("/estoque");
}

export { MAX_PHOTOS_PER_VEHICLE };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/estoque/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Implement the shared form component**

Create `components/VehicleForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/vehicles";
import { MAX_PHOTOS_PER_VEHICLE } from "@/lib/vehicle-photos";

type Props = {
  action: (formData: FormData) => void;
  vehicle?: Vehicle;
  existingPhotoCount?: number;
  pending: boolean;
  error: string | null;
};

export default function VehicleForm({ action, vehicle, existingPhotoCount = 0, pending, error }: Props) {
  const [photoCount, setPhotoCount] = useState(0);
  const remaining = MAX_PHOTOS_PER_VEHICLE - existingPhotoCount - photoCount;

  return (
    <form action={action} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Marca</label>
          <input name="brand" defaultValue={vehicle?.brand} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo</label>
          <input name="model" defaultValue={vehicle?.model} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
          <input name="year" type="number" defaultValue={vehicle?.year} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Preço</label>
          <input name="price" type="number" step="0.01" defaultValue={vehicle?.price} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">KM</label>
          <input name="km" type="number" defaultValue={vehicle?.km} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Câmbio</label>
          <select name="transmission" defaultValue={vehicle?.transmission ?? "automatic"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="automatic">Automático</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Combustível</label>
          <input name="fuel" defaultValue={vehicle?.fuel} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cor</label>
          <input name="color" defaultValue={vehicle?.color} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
        <textarea name="description" defaultValue={vehicle?.description} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Fotos ({existingPhotoCount} já cadastradas — restam {remaining < 0 ? 0 : remaining})
        </label>
        <input
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
          className="w-full text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending || remaining < 0}
        className="px-5 py-2.5 bg-brand-red text-white font-semibold rounded-lg disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 6: Implement `app/estoque/novo/page.tsx`**

Create `app/estoque/novo/page.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { createVehicleAction } from "../actions";
import VehicleForm from "@/components/VehicleForm";

type State = { error: string | null };

export default function NovoVeiculoPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createVehicleAction(formData),
    { error: null }
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar veículo</h1>
      <VehicleForm action={formAction} pending={pending} error={state.error} />
    </div>
  );
}
```

- [ ] **Step 7: Implement `app/estoque/[id]/editar/page.tsx`**

Create `app/estoque/[id]/editar/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/vehicles-data";
import EditarVeiculoForm from "./EditarVeiculoForm";

export default async function EditarVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Editar veículo</h1>
      <EditarVeiculoForm vehicle={vehicle} />
    </div>
  );
}
```

Create `app/estoque/[id]/editar/EditarVeiculoForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { updateVehicleAction, deleteVehicleAction } from "../../actions";
import VehicleForm from "@/components/VehicleForm";
import type { Vehicle } from "@/lib/vehicles";

type State = { error: string | null };

export default function EditarVeiculoForm({ vehicle }: { vehicle: Vehicle }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateVehicleAction(vehicle.id, vehicle.images, formData),
    { error: null }
  );

  return (
    <>
      <VehicleForm
        action={formAction}
        vehicle={vehicle}
        existingPhotoCount={vehicle.images.length}
        pending={pending}
        error={state.error}
      />

      <form
        action={async () => {
          await deleteVehicleAction(vehicle.id);
        }}
        className="mt-6"
      >
        <button type="submit" className="text-sm text-red-600 font-semibold hover:underline">
          Excluir veículo
        </button>
      </form>
    </>
  );
}
```

- [ ] **Step 8: Manual check**

Run `npm run dev`, log in, go to `/estoque/novo`, submit a vehicle with 2 photos. Expect a redirect to `/estoque` and the new vehicle to appear. Open it, go to its `/editar` page, change the price, and confirm it updates. Click "Excluir veículo" and confirm it disappears from `/estoque`. Log out and try visiting `/estoque/novo` directly — expect a redirect to `/login`.

- [ ] **Step 9: Commit**

```bash
git add app/estoque/actions.ts app/estoque/actions.test.ts components/VehicleForm.tsx app/estoque/novo "app/estoque/[id]/editar"
git commit -m "feat: add vehicle create, edit, and delete flows with photo upload"
```

---

## Task 7: Employee management screen

**Files:**
- Create: `app/admin/usuarios/actions.ts`
- Create: `app/admin/usuarios/page.tsx`
- Test: `app/admin/usuarios/actions.test.ts`

**Interfaces:**
- Consumes: `requireUser()` (Task 2), `createAdminSupabaseClient()` (Task 1).
- Produces: `createEmployeeAction(formData: FormData): Promise<{ error: string | null }>`, `resetPasswordAction(formData: FormData): Promise<{ error: string | null }>` from `app/admin/usuarios/actions.ts`.

- [ ] **Step 1: Write the failing tests**

Create `app/admin/usuarios/actions.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";

const requireUserMock = vi.fn();
const createUserMock = vi.fn();
const updateUserByIdMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: createUserMock,
        updateUserById: updateUserByIdMock,
      },
    },
  })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("createEmployeeAction", () => {
  it("requires a session before creating a user", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("REDIRECT:/login"));
    const { createEmployeeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("email", "novo@vsmotors.com.br");
    fd.set("password", "senha-forte-123");

    await expect(createEmployeeAction(fd)).rejects.toThrow("REDIRECT:/login");
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 8 characters", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const { createEmployeeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("email", "novo@vsmotors.com.br");
    fd.set("password", "curta");

    const result = await createEmployeeAction(fd);
    expect(result).toEqual({ error: "A senha deve ter no mínimo 8 caracteres." });
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("creates the user with email confirmed when valid", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    createUserMock.mockResolvedValueOnce({ error: null });
    const { createEmployeeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("email", "novo@vsmotors.com.br");
    fd.set("password", "senha-forte-123");

    const result = await createEmployeeAction(fd);
    expect(result).toEqual({ error: null });
    expect(createUserMock).toHaveBeenCalledWith({
      email: "novo@vsmotors.com.br",
      password: "senha-forte-123",
      email_confirm: true,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/admin/usuarios/actions.test.ts`
Expected: FAIL — `app/admin/usuarios/actions.ts` does not exist yet.

- [ ] **Step 3: Implement `app/admin/usuarios/actions.ts`**

Create `app/admin/usuarios/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type ActionResult = { error: string | null };

export async function createEmployeeAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) return { error: "Informe o e-mail do funcionário." };
  if (password.length < 8) return { error: "A senha deve ter no mínimo 8 caracteres." };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return { error: `Falha ao criar funcionário: ${error.message}` };

  revalidatePath("/admin/usuarios");
  return { error: null };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!userId) return { error: "Usuário inválido." };
  if (password.length < 8) return { error: "A senha deve ter no mínimo 8 caracteres." };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { password });

  if (error) return { error: `Falha ao redefinir senha: ${error.message}` };

  revalidatePath("/admin/usuarios");
  return { error: null };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/admin/usuarios/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Implement `app/admin/usuarios/page.tsx`**

Create `app/admin/usuarios/page.tsx`:

```tsx
import { requireUser } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import UsuariosForms from "./UsuariosForms";

export default async function UsuariosPage() {
  await requireUser();

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.auth.admin.listUsers();
  const users = data.users.map((u) => ({ id: u.id, email: u.email ?? "" }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Gerenciar usuários</h1>
      <UsuariosForms users={users} />
    </div>
  );
}
```

Create `app/admin/usuarios/UsuariosForms.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { createEmployeeAction, resetPasswordAction } from "./actions";

type State = { error: string | null };
type UserRow = { id: string; email: string };

export default function UsuariosForms({ users }: { users: UserRow[] }) {
  const [createState, createFormAction, createPending] = useActionState<State, FormData>(
    async (_prev, formData) => createEmployeeAction(formData),
    { error: null }
  );
  const [resetState, resetFormAction, resetPending] = useActionState<State, FormData>(
    async (_prev, formData) => resetPasswordAction(formData),
    { error: null }
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-bold text-brand-black mb-3">Novo funcionário</h2>
        <form action={createFormAction} className="space-y-3 max-w-sm">
          <input name="email" type="email" placeholder="E-mail" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input name="password" type="password" placeholder="Senha inicial" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          {createState.error && <p className="text-sm text-red-600">{createState.error}</p>}
          <button type="submit" disabled={createPending} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm disabled:opacity-60">
            {createPending ? "Criando..." : "Criar funcionário"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-bold text-brand-black mb-3">Redefinir senha</h2>
        <form action={resetFormAction} className="space-y-3 max-w-sm">
          <select name="userId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Selecione um funcionário</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
          <input name="password" type="password" placeholder="Nova senha" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          {resetState.error && <p className="text-sm text-red-600">{resetState.error}</p>}
          <button type="submit" disabled={resetPending} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm disabled:opacity-60">
            {resetPending ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Manual check**

Run `npm run dev`, log in with the first employee account, visit `/admin/usuarios`, create a second employee with a test password, then log out and log back in as that new employee to confirm it works. Try visiting `/admin/usuarios` while logged out — expect a redirect to `/login`.

- [ ] **Step 7: Commit**

```bash
git add app/admin/usuarios
git commit -m "feat: add employee management screen for creating accounts and resetting passwords"
```

---

## Task 8: Full test suite and lint pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests PASS, including the untouched `components/*.test.tsx` (if any) and every test file created in Tasks 1-7.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: build succeeds. This also surfaces any Server/Client Component boundary mistakes that only show up at build time.

- [ ] **Step 4: Fix anything the above steps surface, then commit**

If any step fails, fix the underlying issue (not by skipping the check) and re-run all three. Once clean:

```bash
git add -A
git commit -m "chore: fix lint/build issues found in final verification pass"
```

Skip this commit if steps 1-3 were already clean.
