"use client";

import { useActionState } from "react";
import { createVehicleAction } from "../actions";
import VehicleForm from "@/components/VehicleForm";

type State = { error: string | null };

export default function NovoVeiculoPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createVehicleAction(formData),
    { error: null }
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Cadastrar veículo</h1>
      <VehicleForm action={formAction} pending={pending} error={state.error} />
    </div>
  );
}
