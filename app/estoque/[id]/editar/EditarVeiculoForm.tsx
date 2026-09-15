"use client";

import { useActionState } from "react";
import { updateVehicleAction, deleteVehicleAction } from "../../actions";
import VehicleForm from "@/components/VehicleForm";
import type { Vehicle } from "@/lib/vehicles";

type State = { error: string | null };

export default function EditarVeiculoForm({ vehicle }: { vehicle: Vehicle }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateVehicleAction(vehicle.id, vehicle.images, formData),
    { error: null }
  );

  return (
    <>
      <VehicleForm
        action={formAction}
        vehicle={vehicle}
        existingPhotoCount={vehicle.images.length}
        pending={pending}
        error={state.error}
      />

      <form
        action={async () => {
          await deleteVehicleAction(vehicle.id);
        }}
        className="mt-6"
      >
        <button type="submit" className="text-sm text-red-600 font-semibold hover:underline">
          Excluir veículo
        </button>
      </form>
    </>
  );
}
