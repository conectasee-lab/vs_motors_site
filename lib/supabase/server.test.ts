import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("createServerSupabaseClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  it("builds a client without throwing when env vars are present", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      getAll: () => [],
      set: () => {},
    } as never);

    const { createServerSupabaseClient } = await import("./server");
    await expect(createServerSupabaseClient()).resolves.toBeDefined();
  });
});
