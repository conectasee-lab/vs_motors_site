import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/vehicles-data";
import EditarVeiculoForm from "./EditarVeiculoForm";

export default async function EditarVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-black mb-6">Editar veículo</h1>
      <EditarVeiculoForm vehicle={vehicle} />
    </div>
  );
}
