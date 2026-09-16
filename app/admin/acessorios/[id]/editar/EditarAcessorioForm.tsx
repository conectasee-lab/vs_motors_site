"use client";

import { useActionState } from "react";
import { updateAccessoryAction } from "../../actions";
import AccessoryForm from "../../AccessoryForm";
import type { Accessory } from "@/lib/accessories";

type State = { error: string | null };

export default function EditarAcessorioForm({ accessory }: { accessory: Accessory }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateAccessoryAction(accessory.id, formData),
    { error: null }
  );

  return <AccessoryForm action={formAction} accessory={accessory} pending={pending} error={state.error} />;
}
