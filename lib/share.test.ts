import { describe, it, expect, vi } from "vitest";
import { shareOrCopy } from "./share";

describe("shareOrCopy", () => {
  it("uses the native share sheet when available and reports it did not copy", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    const writeTextMock = vi.fn();

    const result = await shareOrCopy(
      { share: shareMock, clipboard: { writeText: writeTextMock } },
      { title: "Toyota Corolla", url: "https://vsmotors.com.br/estoque/1" }
    );

    expect(shareMock).toHaveBeenCalledWith({ title: "Toyota Corolla", url: "https://vsmotors.com.br/estoque/1" });
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(result).toEqual({ copied: false });
  });

  it("falls back to copying the link when native share is unavailable", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    const result = await shareOrCopy(
      { clipboard: { writeText: writeTextMock } },
      { title: "Toyota Corolla", url: "https://vsmotors.com.br/estoque/1" }
    );

    expect(writeTextMock).toHaveBeenCalledWith("https://vsmotors.com.br/estoque/1");
    expect(result).toEqual({ copied: true });
  });
});
