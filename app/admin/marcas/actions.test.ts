import { describe, it, expect, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
const LOGO_URL = "https://example.supabase.co/storage/v1/object/public/brand-logos/123-logo.png";

const requireUserMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    from: fromMock,
  })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

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
    const { redirect } = await import("next/navigation");
    const fd = new FormData();
    fd.set("name", "Toyota");

    await expect(createBrandAction(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(insertMock).toHaveBeenCalledWith({ name: "Toyota", logo_url: null });
    expect(redirect).toHaveBeenCalledWith("/admin/marcas");
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

  it("rejects a logo URL outside the brand-logos bucket before touching the database", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });

    const { createBrandAction } = await import("./actions");
    const fd = new FormData();
    fd.set("name", "Toyota");
    fd.set("logo_url", "https://evil.example/logo.gif");

    const result = await createBrandAction(fd);
    expect(result).toEqual({ error: "Logo inválida." });
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("updateBrandAction", () => {
  it("rejects a logo URL outside the brand-logos bucket before touching the database", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });

    const { updateBrandAction } = await import("./actions");
    const fd = new FormData();
    fd.set("name", "Toyota");
    fd.set("logo_url", "https://evil.example/logo.gif");

    const result = await updateBrandAction("b1", "https://old-logo", fd);
    expect(result).toEqual({ error: "Logo inválida." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("updates the brand with the newly uploaded logo URL", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: updateEqMock }));
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("brands");
      return { update: updateMock };
    });

    const { updateBrandAction } = await import("./actions");
    const { redirect } = await import("next/navigation");
    const fd = new FormData();
    fd.set("name", "Toyota");
    fd.set("logo_url", LOGO_URL);

    await expect(updateBrandAction("b1", "https://old-logo", fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(updateMock).toHaveBeenCalledWith({ name: "Toyota", logo_url: LOGO_URL });
    expect(updateEqMock).toHaveBeenCalledWith("id", "b1");
    expect(redirect).toHaveBeenCalledWith("/admin/marcas");
  });

  it("keeps the current logo URL when no new file is provided", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: updateEqMock }));
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("brands");
      return { update: updateMock };
    });

    const { updateBrandAction } = await import("./actions");
    const { redirect } = await import("next/navigation");
    const fd = new FormData();
    fd.set("name", "Toyota");

    await expect(updateBrandAction("b1", "https://old-logo", fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(updateMock).toHaveBeenCalledWith({ name: "Toyota", logo_url: "https://old-logo" });
    expect(updateEqMock).toHaveBeenCalledWith("id", "b1");
    expect(redirect).toHaveBeenCalledWith("/admin/marcas");
  });
});

describe("deleteBrandAction", () => {
  it("blocks deletion when the brand is referenced by vehicles", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });

    const vehiclesSelectMock = vi.fn((columns: string, opts: unknown) => {
      expect(columns).toBe("id");
      expect(opts).toEqual({ count: "exact", head: true });
      return {
        eq: vi.fn((col: string, val: string) => {
          expect(col).toBe("brand_id");
          expect(val).toBe("b1");
          return Promise.resolve({ count: 2, error: null });
        }),
      };
    });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") {
        return { select: vehiclesSelectMock };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteBrandAction } = await import("./actions");
    const result = await deleteBrandAction("b1");

    expect(result).toEqual({ error: "Marca em uso por 2 veículo(s), remova o vínculo antes de excluir." });
    expect(vehiclesSelectMock).toHaveBeenCalled();
  });

  it("deletes the brand when no vehicle references it", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

    const vehiclesSelectMock = vi.fn((columns: string, opts: unknown) => {
      expect(columns).toBe("id");
      expect(opts).toEqual({ count: "exact", head: true });
      return {
        eq: vi.fn((col: string, val: string) => {
          expect(col).toBe("brand_id");
          expect(val).toBe("b1");
          return Promise.resolve({ count: 0, error: null });
        }),
      };
    });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") {
        return { select: vehiclesSelectMock };
      }
      if (table === "brands") {
        return { delete: () => ({ eq: deleteEqMock }) };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteBrandAction } = await import("./actions");
    const { redirect } = await import("next/navigation");

    await expect(deleteBrandAction("b1")).rejects.toThrow("NEXT_REDIRECT");

    expect(deleteEqMock).toHaveBeenCalledWith("id", "b1");
    expect(redirect).toHaveBeenCalledWith("/admin/marcas");
  });
});
