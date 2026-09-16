"use client";

import { useActionState } from "react";
import { createBodyTypeAction } from "../actions";
import BodyTypeForm from "../BodyTypeForm";

type State = { error: string | null };

export default function NovaCarroceriaPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createBodyTypeAction(formData),
    { error: null }
  );

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar carroceria</h1>
        <BodyTypeForm action={formAction} pending={pending} error={state.error} />
      </div>
    </div>
  );
}
