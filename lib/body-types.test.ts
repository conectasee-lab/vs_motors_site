import { describe, it, expect, vi } from "vitest";

const orderMock = vi.fn();
const eqMock = vi.fn();
const maybeSingleMock = vi.fn();
const fromMock = vi.fn(() => ({
  select: () => ({ order: orderMock, eq: eqMock }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getBodyTypes", () => {
  it("maps rows to BodyType objects ordered by name", async () => {
    orderMock.mockResolvedValueOnce({
      data: [
        { id: "1", name: "Sedã" },
        { id: "2", name: "SUV" },
      ],
      error: null,
    });

    const { getBodyTypes } = await import("./body-types");
    const result = await getBodyTypes();

    expect(result).toEqual([
      { id: "1", name: "Sedã" },
      { id: "2", name: "SUV" },
    ]);
  });

  it("returns an empty array on error", async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    const { getBodyTypes } = await import("./body-types");
    const result = await getBodyTypes();

    expect(result).toEqual([]);
  });
});

describe("getBodyTypeById", () => {
  it("returns the body type when found", async () => {
    eqMock.mockReturnValueOnce({ maybeSingle: maybeSingleMock });
    maybeSingleMock.mockResolvedValueOnce({ data: { id: "1", name: "Sedã" }, error: null });

    const { getBodyTypeById } = await import("./body-types");
    const result = await getBodyTypeById("1");

    expect(result).toEqual({ id: "1", name: "Sedã" });
  });

  it("returns null when not found", async () => {
    eqMock.mockReturnValueOnce({ maybeSingle: maybeSingleMock });
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null });

    const { getBodyTypeById } = await import("./body-types");
    const result = await getBodyTypeById("missing");

    expect(result).toBeNull();
  });

  it("throws a friendly error when the query fails", async () => {
    eqMock.mockReturnValueOnce({ maybeSingle: maybeSingleMock });
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    const { getBodyTypeById } = await import("./body-types");

    await expect(getBodyTypeById("1")).rejects.toThrow("Falha ao carregar carroceria: boom");
  });
});
