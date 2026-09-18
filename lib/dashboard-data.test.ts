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
