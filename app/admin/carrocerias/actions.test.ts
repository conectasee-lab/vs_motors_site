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

describe("createBodyTypeAction", () => {
  it("returns an error and never touches the database when there is no session", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("REDIRECT:/login"));
    const { createBodyTypeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "Sedã");

    await expect(createBodyTypeAction(fd)).rejects.toThrow("REDIRECT:/login");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns an error when name is empty", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const { createBodyTypeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "   ");

    const result = await createBodyTypeAction(fd);
    expect(result).toEqual({ error: "Informe o nome da carroceria." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserts the body type and redirects", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("body_types");
      return { insert: insertMock };
    });

    const { createBodyTypeAction } = await import("./actions");
    const { redirect } = await import("next/navigation");
    const fd = new FormData();
    fd.set("name", "Sedã");

    await expect(createBodyTypeAction(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(insertMock).toHaveBeenCalledWith({ name: "Sedã" });
    expect(redirect).toHaveBeenCalledWith("/admin/carrocerias");
  });

  it("returns a friendly error when the name is already taken", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const insertMock = vi.fn().mockResolvedValue({ error: { message: "duplicate key value violates unique constraint" } });
    fromMock.mockReturnValue({ insert: insertMock });

    const { createBodyTypeAction } = await import("./actions");
    const fd = new FormData();
    fd.set("name", "Sedã");

    const result = await createBodyTypeAction(fd);
    expect(result).toEqual({ error: "Já existe uma carroceria com esse nome." });
  });
});

describe("updateBodyTypeAction", () => {
  it("returns an error when name is empty", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const { updateBodyTypeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("name", "");

    const result = await updateBodyTypeAction("b1", fd);
    expect(result).toEqual({ error: "Informe o nome da carroceria." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("updates the body type and redirects", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: updateEqMock }));
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("body_types");
      return { update: updateMock };
    });

    const { updateBodyTypeAction } = await import("./actions");
    const { redirect } = await import("next/navigation");
    const fd = new FormData();
    fd.set("name", "Hatch");

    await expect(updateBodyTypeAction("b1", fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(updateMock).toHaveBeenCalledWith({ name: "Hatch" });
    expect(updateEqMock).toHaveBeenCalledWith("id", "b1");
    expect(redirect).toHaveBeenCalledWith("/admin/carrocerias");
  });
});

describe("deleteBodyTypeAction", () => {
  it("blocks deletion when the body type is referenced by vehicles", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });

    const vehiclesSelectMock = vi.fn((columns: string, opts: unknown) => {
      expect(columns).toBe("id");
      expect(opts).toEqual({ count: "exact", head: true });
      return {
        eq: vi.fn((col: string, val: string) => {
          expect(col).toBe("body_type_id");
          expect(val).toBe("b1");
          return Promise.resolve({ count: 3, error: null });
        }),
      };
    });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") {
        return { select: vehiclesSelectMock };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteBodyTypeAction } = await import("./actions");
    const result = await deleteBodyTypeAction("b1");

    expect(result).toEqual({ error: "Carroceria em uso por 3 veículo(s), remova o vínculo antes de excluir." });
  });

  it("deletes the body type when no vehicle references it", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

    const vehiclesSelectMock = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    }));

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") {
        return { select: vehiclesSelectMock };
      }
      if (table === "body_types") {
        return { delete: () => ({ eq: deleteEqMock }) };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { deleteBodyTypeAction } = await import("./actions");
    const { redirect } = await import("next/navigation");

    await expect(deleteBodyTypeAction("b1")).rejects.toThrow("NEXT_REDIRECT");

    expect(deleteEqMock).toHaveBeenCalledWith("id", "b1");
    expect(redirect).toHaveBeenCalledWith("/admin/carrocerias");
  });
});
