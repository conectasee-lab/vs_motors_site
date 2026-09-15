import { describe, it, expect, vi } from "vitest";

const requireUserMock = vi.fn();
const createUserMock = vi.fn();
const updateUserByIdMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: createUserMock,
        updateUserById: updateUserByIdMock,
      },
    },
  })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("createEmployeeAction", () => {
  it("requires a session before creating a user", async () => {
    requireUserMock.mockRejectedValueOnce(new Error("REDIRECT:/login"));
    const { createEmployeeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("email", "novo@vsmotors.com.br");
    fd.set("password", "senha-forte-123");

    await expect(createEmployeeAction(fd)).rejects.toThrow("REDIRECT:/login");
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 8 characters", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    const { createEmployeeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("email", "novo@vsmotors.com.br");
    fd.set("password", "curta");

    const result = await createEmployeeAction(fd);
    expect(result).toEqual({ error: "A senha deve ter no mínimo 8 caracteres." });
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("creates the user with email confirmed when valid", async () => {
    requireUserMock.mockResolvedValueOnce({ id: "u1" });
    createUserMock.mockResolvedValueOnce({ error: null });
    const { createEmployeeAction } = await import("./actions");

    const fd = new FormData();
    fd.set("email", "novo@vsmotors.com.br");
    fd.set("password", "senha-forte-123");

    const result = await createEmployeeAction(fd);
    expect(result).toEqual({ error: null });
    expect(createUserMock).toHaveBeenCalledWith({
      email: "novo@vsmotors.com.br",
      password: "senha-forte-123",
      email_confirm: true,
    });
  });
});
