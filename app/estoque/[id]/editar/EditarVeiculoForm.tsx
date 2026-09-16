"use client";

import { useActionState, useState, useTransition } from "react";
import { updateVehicleAction, deleteVehicleAction } from "../../actions";
import VehicleForm from "@/components/VehicleForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Vehicle } from "@/lib/vehicles";
import type { Brand } from "@/lib/brands";
import type { BodyType } from "@/lib/body-types";
import type { Accessory } from "@/lib/accessories";

type State = { error: string | null };

export default function EditarVeiculoForm({
  vehicle,
  brands,
  bodyTypes,
  accessories,
}: {
  vehicle: Vehicle;
  brands: Brand[];
  bodyTypes: BodyType[];
  accessories: Accessory[];
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => updateVehicleAction(vehicle.id, formData),
    { error: null }
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleConfirmDelete() {
    startDeleteTransition(async () => {
      const result = await deleteVehicleAction(vehicle.id);
      setDeleteError(result.error);
      if (!result.error) {
        setConfirmOpen(false);
      }
    });
  }

  return (
    <>
      <VehicleForm
        action={formAction}
        vehicle={vehicle}
        brands={brands}
        bodyTypes={bodyTypes}
        accessories={accessories}
        pending={pending}
        error={state.error}
      />

      <div className="mt-6">
        {deleteError && <p className="text-red-600 text-sm mb-2">{deleteError}</p>}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="text-sm text-red-600 font-semibold hover:underline"
        >
          Excluir veículo
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir veículo"
        description="Tem certeza que deseja excluir este veículo? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        pending={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
