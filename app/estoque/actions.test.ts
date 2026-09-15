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
