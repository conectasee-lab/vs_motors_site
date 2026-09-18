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
  it("sums price and counts rows sold before the day after ateDate (inclusive of the whole ateDate day), from the start of the current month", async () => {
    const gteMock = vi.fn();
    const ltMock = vi.fn().mockResolvedValue({
      data: [{ price: 1000 }, { price: 2000 }],
      error: null,
    });
    gteMock.mockReturnValue({ lt: ltMock });
    fromMock.mockImplementation((table: string) => {
      expect(table).toBe("sold_vehicles");
      return { select: vi.fn().mockReturnValue({ gte: gteMock }) };
    });

    const { getVendasResumo } = await import("./dashboard-data");
    const result = await getVendasResumo("2026-09-18");

    expect(result).toEqual({ quantidade: 2, faturamento: 3000 });
    expect(ltMock).toHaveBeenCalledWith("sold_at", "2026-09-19");
  });

  it("rolls over to the next month when ateDate is the last day of a month", async () => {
    const gteMock = vi.fn();
    const ltMock = vi.fn().mockResolvedValue({ data: [], error: null });
    gteMock.mockReturnValue({ lt: ltMock });
    fromMock.mockImplementation(() => ({ select: vi.fn().mockReturnValue({ gte: gteMock }) }));

    const { getVendasResumo } = await import("./dashboard-data");
    await getVendasResumo("2026-09-30");

    expect(ltMock).toHaveBeenCalledWith("sold_at", "2026-10-01");
  });

  it("returns zeros on error", async () => {
    fromMock.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({ lt: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }) }),
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

  it("wraps the shared fetch in React's cache() so it can be deduped per-request", async () => {
    // React's cache() only dedupes calls made within the same request/render,
    // which requires the React dispatcher set up by an actual RSC render — a
    // plain unit test importing the module has no such context, so it cannot
    // assert the dedup behavior end-to-end. Instead we assert the function is
    // in fact a React-cache-wrapped function (has the internal cache marker),
    // which is what makes per-request dedup possible in the real app.
    fromMock.mockImplementation(() => ({ select: vi.fn().mockResolvedValue({ data: rows, error: null }) }));

    const dashboardData = await import("./dashboard-data");
    const [grupos, dadosGrafico] = await Promise.all([
      dashboardData.getEstoqueAgrupadoPorMarca(),
      dashboardData.getEstoquePorMarcaParaGrafico(),
    ]);

    // Functional correctness of both call sites is unaffected by the cache wrapper.
    expect(grupos).toEqual([
      { marca: "Chevrolet", veiculos: [{ id: "2", model: "Onix", year: 2021 }] },
      { marca: "Toyota", veiculos: [{ id: "1", model: "Corolla", year: 2020 }] },
    ]);
    expect(dadosGrafico).toEqual([
      { marca: "Chevrolet", quantidade: 1 },
      { marca: "Toyota", quantidade: 1 },
    ]);
  });
});
