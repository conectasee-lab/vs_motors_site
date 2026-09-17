export type ShareTarget = {
  share?: (data: { title: string; url: string }) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

/** Shares via the native share sheet when available, otherwise copies the link. Returns whether it copied (vs. shared). */
export async function shareOrCopy(nav: ShareTarget, data: { title: string; url: string }): Promise<{ copied: boolean }> {
  if (nav.share) {
    await nav.share(data);
    return { copied: false };
  }
  await nav.clipboard?.writeText(data.url);
  return { copied: true };
}
