"use client";

import { useState } from "react";

export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="text-sm font-semibold text-brand-red hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded"
    >
      {copied ? "E-mail copiado" : "Copiar e-mail"}
    </button>
  );
}
