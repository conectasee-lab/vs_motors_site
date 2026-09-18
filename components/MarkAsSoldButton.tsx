"use client";

import { useState, useTransition } from "react";
import { markVehicleAsSoldAction } from "@/app/estoque/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function MarkAsSoldButton({ vehicleId }: { vehicleId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await markVehicleAsSoldAction(vehicleId);
      setError(result.error);
      if (!result.error) {
        setConfirmOpen(false);
      }
    });
  }

  return (
    <>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-block text-sm font-semibold text-white bg-brand-red px-4 py-2 rounded hover:bg-brand-red/80 transition-colors"
      >
        Vendido
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Marcar como vendido"
        description="Tem certeza que deseja marcar este veículo como vendido? Ele será removido do estoque e não poderá ser desfeito."
        confirmLabel="Vendido"
        pending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
