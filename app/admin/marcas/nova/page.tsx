"use client";

import { useActionState } from "react";
import { createBrandAction } from "../actions";
import { prepareBrandLogo, removeUploaded } from "@/lib/storage-upload";
import BrandForm from "../BrandForm";

type State = { error: string | null };

export default function NovaMarcaPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const logo = await prepareBrandLogo(formData);
      if (logo.error) return { error: logo.error };
      const result = await createBrandAction(formData);
      if (result.error) await removeUploaded("brand-logos", logo.uploaded);
      return result;
    },
    { error: null }
  );

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar marca</h1>
        <BrandForm action={formAction} pending={pending} error={state.error} />
      </div>
    </div>
  );
}
