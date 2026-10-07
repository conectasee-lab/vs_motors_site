export type ImageBucket = "vehicle-photos" | "brand-logos";

export function publicBucketPrefix(bucket: ImageBucket): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
}

/** True when `url` points at a file inside our own public `bucket`, so forms can't save arbitrary URLs. */
export function isBucketPublicUrl(url: string, bucket: ImageBucket): boolean {
  return url.startsWith(publicBucketPrefix(bucket));
}
