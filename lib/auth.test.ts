import { describe, it, expect, vi } from "vitest";

const getUserMock = vi.fn();

vi.mock("./supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: getUserMock },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

describe("getSessionUser", () => {
  it("returns the user when a session exists", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
    const { getSessionUser } = await import("./auth");
    expect(await getSessionUser()).toEqual({ id: "u1" });
  });

  it("returns null when there is no session", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const { getSessionUser } = await import("./auth");
    expect(await getSessionUser()).toBeNull();
  });
});

describe("requireUser", () => {
  it("returns the user when a session exists", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
    const { requireUser } = await import("./auth");
    expect(await requireUser()).toEqual({ id: "u1" });
  });

  it("redirects to /login when there is no session", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const { requireUser } = await import("./auth");
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
  });
});
