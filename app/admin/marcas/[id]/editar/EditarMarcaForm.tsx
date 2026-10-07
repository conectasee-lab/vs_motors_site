"use client";

import { useActionState } from "react";
import { updateBrandAction } from "../../actions";
import { prepareBrandLogo, removeUploaded } from "@/lib/storage-upload";
import BrandForm from "../../BrandForm";
import type { Brand } from "@/lib/brands";

type State = { error: string | null };

export default function EditarMarcaForm({ brand }: { brand: Brand }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const logo = await prepareBrandLogo(formData);
      if (logo.error) return { error: logo.error };
      const result = await updateBrandAction(brand.id, brand.logoUrl, formData);
      if (result.error) await removeUploaded("brand-logos", logo.uploaded);
      return result;
    },
    { error: null }
  );

  return <BrandForm action={formAction} brand={brand} pending={pending} error={state.error} />;
}
