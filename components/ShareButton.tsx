"use client";

import { useState } from "react";
import { shareOrCopy } from "@/lib/share";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const result = await shareOrCopy(navigator, { title, url: window.location.href });
    if (result.copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 border border-gray-200 text-brand-black font-semibold px-6 py-3 rounded-lg hover:border-brand-black transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path strokeLinecap="round" d="m8.6 10.5 6.8-3.9M8.6 13.5l6.8 3.9" />
      </svg>
      {copied ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
