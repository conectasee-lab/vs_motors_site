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
