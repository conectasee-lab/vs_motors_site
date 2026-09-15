import { describe, it, expect } from "vitest";
import { mapAuthError } from "./auth-errors";

describe("mapAuthError", () => {
  it("returns a generic message for invalid credentials, without revealing whether the email exists", () => {
    expect(mapAuthError("Invalid login credentials")).toBe(
      "E-mail ou senha incorretos."
    );
  });

  it("returns a rate-limit message when Supabase reports too many requests", () => {
    expect(mapAuthError("Email rate limit exceeded")).toBe(
      "Muitas tentativas. Aguarde alguns minutos e tente novamente."
    );
    expect(mapAuthError("Request rate limit reached")).toBe(
      "Muitas tentativas. Aguarde alguns minutos e tente novamente."
    );
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(mapAuthError("Something exploded")).toBe(
      "Não foi possível entrar. Tente novamente."
    );
  });

  it("falls back to a generic message when there is no error text", () => {
    expect(mapAuthError(undefined)).toBe("Não foi possível entrar. Tente novamente.");
  });
});
