import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/vehicles-data";
import { getBrands } from "@/lib/brands";
import { requireUser } from "@/lib/auth";
import EditarVeiculoForm from "./EditarVeiculoForm";

export default async function EditarVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const [vehicle, brands] = await Promise.all([getVehicleById(id), getBrands()]);
  if (!vehicle) notFound();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Editar veículo</h1>
        <EditarVeiculoForm vehicle={vehicle} brands={brands} />
      </div>
    </div>
  );
}
