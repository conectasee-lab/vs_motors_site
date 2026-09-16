import { describe, it, expect, vi } from "vitest";

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

describe("createAccessoryAction", () => {
  it("returns an error and never touches the database when there is no session", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("REDIRECT:/login"));
    const { createAccessoryAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "Ar condicionado");

    await expect(createAccessoryAction(fd)).rejects.toThrow("REDIRECT:/login");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns an error when name is empty", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const { createAccessoryAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "   ");

    const result = await createAccessoryAction(fd);
    expect(result).toEqual({ error: "Informe o nome do acessório." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserts the accessory and redirects", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("accessories");
      return { insert: insertMock };
    });

    const { createAccessoryAction } = await import("./actions");
    const { redirect } = await import("next/navigation");
    const fd = new FormData();
    fd.set("name", "Ar condicionado");

    await expect(createAccessoryAction(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(insertMock).toHaveBeenCalledWith({ name: "Ar condicionado" });
    expect(redirect).toHaveBeenCalledWith("/admin/acessorios");
  });

  it("returns a friendly error when the name is already taken", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const insertMock = vi.fn().mockResolvedValue({ error: { message: "duplicate key value violates unique constraint" } });
    fromMock.mockReturnValue({ insert: insertMock });

    const { createAccessoryAction } = await import("./actions");
    const fd = new FormData();
    fd.set("name", "Ar condicionado");

    const result = await createAccessoryAction(fd);
    expect(result).toEqual({ error: "Já existe um acessório com esse nome." });
  });
});

describe("updateAccessoryAction", () => {
  it("returns an error when name is empty", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const { updateAccessoryAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "");

    const result = await updateAccessoryAction("a1", fd);
    expect(result).toEqual({ error: "Informe o nome do acessório." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("updates the accessory and redirects", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: updateEqMock }));
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("accessories");
      return { update: updateMock };
    });

    const { updateAccessoryAction } = await import("./actions");
    const { redirect } = await import("next/navigation");
    const fd = new FormData();
    fd.set("name", "Câmera de ré");

    await expect(updateAccessoryAction("a1", fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(updateMock).toHaveBeenCalledWith({ name: "Câmera de ré" });
    expect(updateEqMock).toHaveBeenCalledWith("id", "a1");
    expect(redirect).toHaveBeenCalledWith("/admin/acessorios");
  });
});

describe("deleteAccessoryAction", () => {
  it("blocks deletion when the accessory is referenced by vehicles", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });

    const vaSelectMock = vi.fn((columns: string, opts: unknown) => {
      expect(columns).toBe("vehicle_id");
      expect(opts).toEqual({ count: "exact", head: true });
      return {
        eq: vi.fn((col: string, val: string) => {
          expect(col).toBe("accessory_id");
          expect(val).toBe("a1");
          return Promise.resolve({ count: 3, error: null });
        }),
      };
    });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicle_accessories") {
        return { select: vaSelectMock };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteAccessoryAction } = await import("./actions");
    const result = await deleteAccessoryAction("a1");

    expect(result).toEqual({ error: "Acessório em uso por 3 veículo(s), remova o vínculo antes de excluir." });
  });

  it("deletes the accessory when no vehicle references it", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

    const vaSelectMock = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    }));

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicle_accessories") {
        return { select: vaSelectMock };
      }
      if (table === "accessories") {
        return { delete: () => ({ eq: deleteEqMock }) };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteAccessoryAction } = await import("./actions");
    const { redirect } = await import("next/navigation");

    await expect(deleteAccessoryAction("a1")).rejects.toThrow("NEXT_REDIRECT");

    expect(deleteEqMock).toHaveBeenCalledWith("id", "a1");
    expect(redirect).toHaveBeenCalledWith("/admin/acessorios");
  });
});
