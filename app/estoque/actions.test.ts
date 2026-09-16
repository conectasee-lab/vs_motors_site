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
  fd.set("brand_id", "1");
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

  it("returns a friendly error and deletes the orphaned row when photo upload fails", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    uploadMock.mockResolvedValueOnce({ error: { message: "bucket unreachable" } });

    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
    const singleMock = vi.fn().mockResolvedValue({ data: { id: "v1" }, error: null });
    const selectMock = vi.fn(() => ({ single: singleMock }));
    const insertMock = vi.fn(() => ({ select: selectMock }));

    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("vehicles");
      return {
        insert: insertMock,
        delete: () => ({ eq: deleteEqMock }),
      };
    });

    const fd = baseFormData();
    fd.append("photos", new File(["x"], "p1.jpg", { type: "image/jpeg" }));

    const { createVehicleAction } = await import("./actions");
    const result = await createVehicleAction(fd);

    expect(result).toEqual({
      error: "Falha ao enviar foto p1.jpg: bucket unreachable",
    });
    expect(deleteEqMock).toHaveBeenCalledWith("id", "v1");
  });
});

describe("updateVehicleAction", () => {
  it("returns a friendly error without throwing when photo upload fails", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    uploadMock.mockResolvedValueOnce({ error: { message: "bucket unreachable" } });
    fromMock.mockReset();

    const fd = baseFormData();
    fd.append("photos", new File(["x"], "p1.jpg", { type: "image/jpeg" }));

    const { updateVehicleAction } = await import("./actions");
    const result = await updateVehicleAction("v1", [], fd);

    expect(result).toEqual({
      error: "Falha ao enviar foto p1.jpg: bucket unreachable",
    });
    expect(fromMock).not.toHaveBeenCalled();
  });
});
