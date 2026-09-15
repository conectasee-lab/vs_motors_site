import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/vehicles-data";
import { getSessionUser } from "@/lib/auth";
import WhatsAppButton from "@/components/WhatsAppButton";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, user] = await Promise.all([getVehicleById(id), getSessionUser()]);
  if (!vehicle) notFound();
  const isLoggedIn = !!user;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden mb-6">
        {vehicle.images.length > 0 ? (
          <Image
            src={vehicle.images[0]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-black-soft text-gray-400 text-sm">
            Sem foto
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </h1>
        {isLoggedIn && (
          <Link
            href={`/estoque/${vehicle.id}/editar`}
            className="shrink-0 text-sm font-semibold text-brand-black bg-brand-gold px-4 py-2 rounded hover:bg-brand-gold/80 transition-colors"
          >
            Editar
          </Link>
        )}
      </div>
      <p className="text-brand-red text-2xl font-bold mt-2 mb-6">
        {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300 bg-brand-black-soft border border-brand-gold/20 rounded-lg p-4 mb-6">
        <p><span className="text-brand-gold">Ano:</span> {vehicle.year}</p>
        <p><span className="text-brand-gold">KM:</span> {vehicle.km.toLocaleString("pt-BR")}</p>
        <p><span className="text-brand-gold">Câmbio:</span> {vehicle.transmission === "automatic" ? "Automático" : "Manual"}</p>
        <p><span className="text-brand-gold">Combustível:</span> {vehicle.fuel}</p>
        <p><span className="text-brand-gold">Cor:</span> {vehicle.color}</p>
      </div>

      <p className="text-gray-300 mb-8">{vehicle.description}</p>

      <WhatsAppButton vehicle={vehicle} />
    </div>
  );
}
