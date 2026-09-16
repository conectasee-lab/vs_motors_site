import { describe, it, expect, vi } from "vitest";

const orderMock = vi.fn();
const selectMock = vi.fn((_columns: string) => ({ order: orderMock }));
const eqMock = vi.fn();
const maybeSingleMock = vi.fn();
const fromMock = vi.fn(() => ({
  select: (columns: string) => {
    if (columns === "*") return { order: orderMock, eq: eqMock };
    return selectMock(columns);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getBrands", () => {
  it("maps rows to Brand objects ordered by name", async () => {
    orderMock.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Toyota", logo_url: "https://x/toyota.png" },
        { id: "2", name: "Honda", logo_url: null },
      ],
      error: null,
    });

    const { getBrands } = await import("./brands");
    const result = await getBrands();

    expect(result).toEqual([
      { id: "1", name: "Toyota", logoUrl: "https://x/toyota.png" },
      { id: "2", name: "Honda", logoUrl: null },
    ]);
  });

  it("returns an empty array on error", async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    const { getBrands } = await import("./brands");
    const result = await getBrands();

    expect(result).toEqual([]);
  });
});

describe("getBrandById", () => {
  it("returns null when not found", async () => {
    eqMock.mockReturnValueOnce({ maybeSingle: maybeSingleMock });
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null });

    const { getBrandById } = await import("./brands");
    const result = await getBrandById("missing");

    expect(result).toBeNull();
  });
});
