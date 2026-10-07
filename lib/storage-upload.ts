// Browser-side uploads straight to Supabase Storage. Sending files through
// server actions would hit the hosting request-body limit (4.5MB on Vercel).
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { publicBucketPrefix, type ImageBucket } from "@/lib/storage";
import { validatePhotos, sanitizeFileName } from "@/lib/vehicle-photos";

type PrepareResult = { error: string | null; uploaded: string[] };

function filesFrom(formData: FormData, field: string): File[] {
  return formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
}

async function uploadToBucket(bucket: ImageBucket, folder: string, files: File[]): Promise<string[]> {
  const supabase = createBrowserSupabaseClient();
  const urls: string[] = [];
  try {
    for (const file of files) {
      const path = `${folder}${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) throw new Error(`Falha ao enviar ${file.name}: ${error.message}`);
      urls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    }
  } catch (err) {
    await removeUploaded(bucket, urls);
    throw err;
  }
  return urls;
}

/** Best-effort cleanup of files uploaded for a save that then failed. */
export async function removeUploaded(bucket: ImageBucket, urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const prefix = publicBucketPrefix(bucket);
  try {
    await createBrowserSupabaseClient()
      .storage.from(bucket)
      .remove(urls.map((u) => u.slice(prefix.length)));
  } catch {
    // ignore: an orphaned file is harmless
  }
}

/**
 * Uploads the files in `formData`'s `fileField`, then replaces them with their
 * public URLs under `urlField` so the server action receives only text.
 */
async function prepareUploads(
  formData: FormData,
  { fileField, urlField, bucket, folder, existingCount }: {
    fileField: string;
    urlField: string;
    bucket: ImageBucket;
    folder: string;
    existingCount: number;
  }
): Promise<PrepareResult> {
  const files = filesFrom(formData, fileField);
  formData.delete(fileField);
  if (files.length === 0) return { error: null, uploaded: [] };

  const check = validatePhotos(existingCount, files.map((f) => ({ name: f.name, type: f.type, size: f.size })));
  if (check.error) return { error: check.error, uploaded: [] };

  try {
    const uploaded = await uploadToBucket(bucket, folder, files);
    uploaded.forEach((url) => formData.append(urlField, url));
    return { error: null, uploaded };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao enviar fotos.", uploaded: [] };
  }
}

export function prepareVehiclePhotos(formData: FormData, vehicleId?: string): Promise<PrepareResult> {
  return prepareUploads(formData, {
    fileField: "photos",
    urlField: "photo_urls",
    bucket: "vehicle-photos",
    folder: `${vehicleId ?? crypto.randomUUID()}/`,
    existingCount: formData.getAll("kept_images").length,
  });
}

export function prepareBrandLogo(formData: FormData): Promise<PrepareResult> {
  return prepareUploads(formData, {
    fileField: "logo",
    urlField: "logo_url",
    bucket: "brand-logos",
    folder: "",
    existingCount: 0,
  });
}
