"use client";

import { useActionState } from "react";
import { createVehicleAction } from "../actions";
import { prepareVehiclePhotos, removeUploaded } from "@/lib/storage-upload";
import VehicleForm from "@/components/VehicleForm";
import type { Brand } from "@/lib/brands";
import type { BodyType } from "@/lib/body-types";
import type { Accessory } from "@/lib/accessories";

type State = { error: string | null };

export default function NovoVeiculoForm({
  brands,
  bodyTypes,
  accessories,
}: {
  brands: Brand[];
  bodyTypes: BodyType[];
  accessories: Accessory[];
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const photos = await prepareVehiclePhotos(formData);
      if (photos.error) return { error: photos.error };
      const result = await createVehicleAction(formData);
      if (result.error) await removeUploaded("vehicle-photos", photos.uploaded);
      return result;
    },
    { error: null }
  );

  return (
    <VehicleForm
      action={formAction}
      brands={brands}
      bodyTypes={bodyTypes}
      accessories={accessories}
      pending={pending}
      error={state.error}
    />
  );
}
