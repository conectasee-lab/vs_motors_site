"use client";

import { useActionState } from "react";
import { updateBodyTypeAction } from "../../actions";
import BodyTypeForm from "../../BodyTypeForm";
import type { BodyType } from "@/lib/body-types";

type State = { error: string | null };

export default function EditarCarroceriaForm({ bodyType }: { bodyType: BodyType }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateBodyTypeAction(bodyType.id, formData),
    { error: null }
  );

  return <BodyTypeForm action={formAction} bodyType={bodyType} pending={pending} error={state.error} />;
}
