"use client";

import { useActionState } from "react";
import { createAccessoryAction } from "../actions";
import AccessoryForm from "../AccessoryForm";

type State = { error: string | null };

export default function NovoAcessorioPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createAccessoryAction(formData),
    { error: null }
  );

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar acessório</h1>
        <AccessoryForm action={formAction} pending={pending} error={state.error} />
      </div>
    </div>
  );
}
