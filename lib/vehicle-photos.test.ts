import { describe, it, expect } from "vitest";
import { validatePhotos, MAX_PHOTOS_PER_VEHICLE } from "./vehicle-photos";

function file(name: string, type = "image/jpeg", size = 1024) {
  return { name, type, size };
}

describe("validatePhotos", () => {
  it("accepts a valid set of photos within the limit", () => {
    const result = validatePhotos(0, [file("a.jpg"), file("b.png", "image/png")]);
    expect(result).toEqual({ error: null });
  });

  it("rejects when total photos would exceed the limit", () => {
    const incoming = Array.from({ length: 5 }, (_, i) => file(`p${i}.jpg`));
    const result = validatePhotos(MAX_PHOTOS_PER_VEHICLE - 2, incoming);
    expect(result.error).toBe(`Máximo de ${MAX_PHOTOS_PER_VEHICLE} fotos por veículo.`);
  });

  it("rejects unsupported file types", () => {
    const result = validatePhotos(0, [file("doc.pdf", "application/pdf")]);
    expect(result.error).toBe("Formato de arquivo não suportado: doc.pdf.");
  });

  it("rejects files over the size limit", () => {
    const result = validatePhotos(0, [file("big.jpg", "image/jpeg", 6 * 1024 * 1024)]);
    expect(result.error).toBe("Arquivo muito grande: big.jpg (máximo 5MB).");
  });
});
