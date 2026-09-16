"use client";

import { useActionState } from "react";
import { updateBrandAction } from "../../actions";
import BrandForm from "../../BrandForm";
import type { Brand } from "@/lib/brands";

type State = { error: string | null };

export default function EditarMarcaForm({ brand }: { brand: Brand }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateBrandAction(brand.id, brand.logoUrl, formData),
    { error: null }
  );

  return <BrandForm action={formAction} brand={brand} pending={pending} error={state.error} />;
}
