"use client";

import { useActionState, useState } from "react";
import { updateVehicleAction, deleteVehicleAction } from "../../actions";
import VehicleForm from "@/components/VehicleForm";
import type { Vehicle } from "@/lib/vehicles";

type State = { error: string | null };

export default function EditarVeiculoForm({ vehicle }: { vehicle: Vehicle }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateVehicleAction(vehicle.id, vehicle.images, formData),
    { error: null }
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
          const result = await deleteVehicleAction(vehicle.id);
          setDeleteError(result.error);
        }}
        className="mt-6"
      >
        {deleteError && <p className="text-red-600 text-sm mb-2">{deleteError}</p>}
        <button type="submit" className="text-sm text-red-600 font-semibold hover:underline">
          Excluir veículo
        </button>
      </form>
    </>
  );
}
