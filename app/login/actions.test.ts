import { describe, it, expect, vi } from "vitest";

const signInMock = vi.fn();
const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { signInWithPassword: signInMock },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("loginAction", () => {
  it("redirects to /estoque on successful login", async () => {
    signInMock.mockResolvedValueOnce({ error: null });
    const { loginAction } = await import("./actions");

    const formData = new FormData();
    formData.set("email", "func@vsmotors.com.br");
    formData.set("password", "correct-horse");

    await expect(loginAction({ error: null }, formData)).rejects.toThrow(
      "REDIRECT:/estoque"
    );
  });

  it("returns a mapped error message on invalid credentials", async () => {
    signInMock.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    const { loginAction } = await import("./actions");

    const formData = new FormData();
    formData.set("email", "func@vsmotors.com.br");
    formData.set("password", "wrong");

    const result = await loginAction({ error: null }, formData);
    expect(result).toEqual({ error: "E-mail ou senha incorretos." });
  });
});
