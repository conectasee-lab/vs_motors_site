"use client";

import { useActionState } from "react";
import { createVehicleAction } from "../actions";
import VehicleForm from "@/components/VehicleForm";
import type { Brand } from "@/lib/brands";

type State = { error: string | null };

export default function NovoVeiculoForm({ brands }: { brands: Brand[] }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createVehicleAction(formData),
    { error: null }
  );

  return <VehicleForm action={formAction} brands={brands} pending={pending} error={state.error} />;
}
