import { describe, it, expect, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
const PHOTO_PREFIX = "https://example.supabase.co/storage/v1/object/public/vehicle-photos/";

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
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

function baseFormData() {
  const fd = new FormData();
  fd.set("brand_id", "b1");
  fd.set("body_type_id", "t1");
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

  it("returns an error when body_type_id is missing", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const fd = baseFormData();
    fd.set("body_type_id", "");
    const { createVehicleAction } = await import("./actions");

    const result = await createVehicleAction(fd);
    expect(result).toEqual({ error: "Preencha todos os campos obrigatórios." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns an error when more than 14 photos are submitted", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const fd = baseFormData();
    for (let i = 0; i < 15; i++) {
      fd.append("photo_urls", `${PHOTO_PREFIX}v/p${i}.jpg`);
    }
    const { createVehicleAction } = await import("./actions");

    const result = await createVehicleAction(fd);
    expect(result).toEqual({ error: "Máximo de 14 fotos por veículo." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects photo URLs outside the vehicle-photos bucket", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    fromMock.mockClear();
    const fd = baseFormData();
    fd.append("photo_urls", "https://evil.example/p1.jpg");
    const { createVehicleAction } = await import("./actions");

    const result = await createVehicleAction(fd);
    expect(result).toEqual({ error: "Foto inválida." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserts the vehicle with the uploaded photos, featured first", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const singleMock = vi.fn().mockResolvedValue({ data: { id: "v1" }, error: null });
    const insertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("vehicles");
      return { insert: insertMock };
    });

    const fd = baseFormData();
    fd.append("photo_urls", `${PHOTO_PREFIX}v/p0.jpg`);
    fd.append("photo_urls", `${PHOTO_PREFIX}v/p1.jpg`);
    fd.set("featured", "new:1");

    const { createVehicleAction } = await import("./actions");
    await createVehicleAction(fd);

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ images: [`${PHOTO_PREFIX}v/p1.jpg`, `${PHOTO_PREFIX}v/p0.jpg`] }),
    );
  });
});

describe("updateVehicleAction", () => {
  it("rejects when kept plus uploaded photos exceed the limit", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    fromMock.mockReset();

    const fd = baseFormData();
    for (let i = 0; i < 14; i++) fd.append("kept_images", `${PHOTO_PREFIX}v1/k${i}.jpg`);
    fd.append("photo_urls", `${PHOTO_PREFIX}v1/new.jpg`);

    const { updateVehicleAction } = await import("./actions");
    const result = await updateVehicleAction("v1", fd);

    expect(result).toEqual({ error: "Máximo de 14 fotos por veículo." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("saves only the kept images plus newly uploaded ones, reflecting removals", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateVehicleMock = vi.fn(() => ({ eq: updateEqMock }));
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") return { update: updateVehicleMock };
      if (table === "vehicle_accessories") return { delete: () => ({ eq: deleteEqMock }) };
      throw new Error(`unexpected table ${table}`);
    });

    const { updateVehicleAction } = await import("./actions");
    const fd = baseFormData();
    fd.append("kept_images", "https://cdn/photo-1.jpg");

    await updateVehicleAction("v1", fd);

    expect(updateVehicleMock).toHaveBeenCalledWith(
      expect.objectContaining({ images: ["https://cdn/photo-1.jpg"] }),
    );
  });

  it("drops removed photos entirely when no kept_images are submitted", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateVehicleMock = vi.fn(() => ({ eq: updateEqMock }));
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") return { update: updateVehicleMock };
      if (table === "vehicle_accessories") return { delete: () => ({ eq: deleteEqMock }) };
      throw new Error(`unexpected table ${table}`);
    });

    const { updateVehicleAction } = await import("./actions");
    await updateVehicleAction("v1", baseFormData());

    expect(updateVehicleMock).toHaveBeenCalledWith(
      expect.objectContaining({ images: [] }),
    );
  });
});

describe("brand validation", () => {
  it("rejects creating a vehicle without a brand", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    fromMock.mockClear();
    const { createVehicleAction } = await import("./actions");
    const fd = baseFormData();
    fd.set("brand_id", "");

    const result = await createVehicleAction(fd);

    expect(result).toEqual({ error: "Selecione a marca do veículo." });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects updating a vehicle without a brand", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    fromMock.mockClear();
    const { updateVehicleAction } = await import("./actions");
    const fd = baseFormData();
    fd.set("brand_id", "");

    const result = await updateVehicleAction("v1", fd);

    expect(result).toEqual({ error: "Selecione a marca do veículo." });
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("createVehicleAction accessories", () => {
  it("links the selected accessories after inserting the vehicle", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const singleMock = vi.fn().mockResolvedValue({ data: { id: "v1" }, error: null });
    const selectMock = vi.fn(() => ({ single: singleMock }));
    const insertVehicleMock = vi.fn(() => ({ select: selectMock }));
    const insertAccessoriesMock = vi.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") return { insert: insertVehicleMock };
      if (table === "vehicle_accessories") return { insert: insertAccessoriesMock };
      throw new Error(`unexpected table ${table}`);
    });

    const { createVehicleAction } = await import("./actions");
    const fd = baseFormData();
    fd.append("accessory_ids", "a1");
    fd.append("accessory_ids", "a2");

    await createVehicleAction(fd);

    expect(insertAccessoriesMock).toHaveBeenCalledWith([
      { vehicle_id: "v1", accessory_id: "a1" },
      { vehicle_id: "v1", accessory_id: "a2" },
    ]);
  });

  it("never touches vehicle_accessories when no accessory is selected", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const singleMock = vi.fn().mockResolvedValue({ data: { id: "v1" }, error: null });
    const selectMock = vi.fn(() => ({ single: singleMock }));
    const insertVehicleMock = vi.fn(() => ({ select: selectMock }));

    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("vehicles");
      return { insert: insertVehicleMock };
    });

    const { createVehicleAction } = await import("./actions");
    await createVehicleAction(baseFormData());

    expect(fromMock).not.toHaveBeenCalledWith("vehicle_accessories");
  });
});

describe("markVehicleAsSoldAction", () => {
  it("inserts into sold_vehicles with the resolved brand name, then deletes from vehicles", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const singleMock = vi.fn().mockResolvedValue({
      data: { model: "Corolla", year: 2021, km: 32000, price: 112000, brand: { name: "Toyota" } },
      error: null,
    });
    const eqSelectMock = vi.fn(() => ({ single: singleMock }));
    const selectMock = vi.fn(() => ({ eq: eqSelectMock }));
    const insertSoldMock = vi.fn().mockResolvedValue({ error: null });
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") return { select: selectMock, delete: () => ({ eq: deleteEqMock }) };
      if (table === "sold_vehicles") return { insert: insertSoldMock };
      throw new Error(`unexpected table ${table}`);
    });

    const { markVehicleAsSoldAction } = await import("./actions");
    await markVehicleAsSoldAction("v1");

    expect(insertSoldMock).toHaveBeenCalledWith({
      brand: "Toyota",
      model: "Corolla",
      year: 2021,
      km: 32000,
      price: 112000,
    });
    expect(deleteEqMock).toHaveBeenCalledWith("id", "v1");
  });

  it("returns an error and never deletes when the vehicle is not found", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } });
    const eqSelectMock = vi.fn(() => ({ single: singleMock }));
    const selectMock = vi.fn(() => ({ eq: eqSelectMock }));
    const deleteEqMock = vi.fn();

    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("vehicles");
      return { select: selectMock, delete: () => ({ eq: deleteEqMock }) };
    });

    const { markVehicleAsSoldAction } = await import("./actions");
    const result = await markVehicleAsSoldAction("v1");

    expect(result).toEqual({ error: "Veículo não encontrado." });
    expect(deleteEqMock).not.toHaveBeenCalled();
  });

  it("returns a friendly error and does not delete the vehicle when the sold_vehicles insert fails", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const singleMock = vi.fn().mockResolvedValue({
      data: { model: "Corolla", year: 2021, km: 32000, price: 112000, brand: { name: "Toyota" } },
      error: null,
    });
    const eqSelectMock = vi.fn(() => ({ single: singleMock }));
    const selectMock = vi.fn(() => ({ eq: eqSelectMock }));
    const insertSoldMock = vi.fn().mockResolvedValue({ error: { message: "constraint violated" } });
    const deleteEqMock = vi.fn();

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") return { select: selectMock, delete: () => ({ eq: deleteEqMock }) };
      if (table === "sold_vehicles") return { insert: insertSoldMock };
      throw new Error(`unexpected table ${table}`);
    });

    const { markVehicleAsSoldAction } = await import("./actions");
    const result = await markVehicleAsSoldAction("v1");

    expect(result).toEqual({ error: "Falha ao registrar venda: constraint violated" });
    expect(deleteEqMock).not.toHaveBeenCalled();
  });
});

describe("updateVehicleAction accessories", () => {
  it("clears old links and inserts the newly selected accessories", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateVehicleMock = vi.fn(() => ({ eq: updateEqMock }));
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
    const insertAccessoriesMock = vi.fn().mockResolvedValue({ error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") return { update: updateVehicleMock };
      if (table === "vehicle_accessories") {
        return {
          delete: () => ({ eq: deleteEqMock }),
          insert: insertAccessoriesMock,
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { updateVehicleAction } = await import("./actions");
    const fd = baseFormData();
    fd.append("accessory_ids", "a2");

    await updateVehicleAction("v1", fd);

    expect(deleteEqMock).toHaveBeenCalledWith("vehicle_id", "v1");
    expect(insertAccessoriesMock).toHaveBeenCalledWith([{ vehicle_id: "v1", accessory_id: "a2" }]);
  });

  it("clears all links and inserts nothing when every accessory is unchecked", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateVehicleMock = vi.fn(() => ({ eq: updateEqMock }));
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
    const insertAccessoriesMock = vi.fn();

    fromMock.mockImplementation((table: string) => {
      if (table === "vehicles") return { update: updateVehicleMock };
      if (table === "vehicle_accessories") {
        return {
          delete: () => ({ eq: deleteEqMock }),
          insert: insertAccessoriesMock,
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const { updateVehicleAction } = await import("./actions");
    await updateVehicleAction("v1", baseFormData());

    expect(deleteEqMock).toHaveBeenCalledWith("vehicle_id", "v1");
    expect(insertAccessoriesMock).not.toHaveBeenCalled();
  });
});
