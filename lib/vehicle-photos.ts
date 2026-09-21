export const MAX_PHOTOS_PER_VEHICLE = 14;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

type IncomingFile = { name: string; type: string; size: number };

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export function validatePhotos(
  existingCount: number,
  incoming: IncomingFile[]
): { error: string | null } {
  if (existingCount + incoming.length > MAX_PHOTOS_PER_VEHICLE) {
    return { error: `Máximo de ${MAX_PHOTOS_PER_VEHICLE} fotos por veículo.` };
  }

  for (const f of incoming) {
    if (!ALLOWED_PHOTO_TYPES.includes(f.type)) {
      return { error: `Formato de arquivo não suportado: ${f.name}.` };
    }
    if (f.size > MAX_PHOTO_SIZE_BYTES) {
      return { error: `Arquivo muito grande: ${f.name} (máximo 5MB).` };
    }
  }

  return { error: null };
}

/**
 * Orders images so the featured one comes first (the site uses images[0] as cover).
 * `featured` is either a kept image URL or "new:<index>" pointing into `uploaded`.
 */
export function orderImagesWithFeatured(
  kept: string[],
  uploaded: string[],
  featured: string | null
): string[] {
  const all = [...kept, ...uploaded];
  let featuredUrl: string | undefined;
  if (featured?.startsWith("new:")) featuredUrl = uploaded[Number(featured.slice(4))];
  else if (featured && kept.includes(featured)) featuredUrl = featured;
  if (!featuredUrl) return all;
  return [featuredUrl, ...all.filter((u) => u !== featuredUrl)];
}
