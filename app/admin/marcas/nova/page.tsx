"use client";

import { useActionState } from "react";
import { createBrandAction } from "../actions";
import BrandForm from "../BrandForm";

type State = { error: string | null };

export default function NovaMarcaPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createBrandAction(formData),
    { error: null }
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar marca</h1>
      <BrandForm action={formAction} pending={pending} error={state.error} />
    </div>
  );
}
