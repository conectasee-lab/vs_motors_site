import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles";

export default function VehicleCard({
  vehicle,
  isLoggedIn = false,
}: {
  vehicle: Vehicle;
  isLoggedIn?: boolean;
}) {
  return (
    <div className="group relative block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <Link href={`/estoque/${vehicle.id}`} className="block">
        <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
          {vehicle.images.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-sm">
              Sem foto
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-gray-900 font-bold text-lg">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {vehicle.year} · {vehicle.km.toLocaleString("pt-BR")} km
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-blue-600 font-bold text-xl">
              {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>
      </Link>
      {isLoggedIn && (
        <Link
          href={`/estoque/${vehicle.id}/editar`}
          className="absolute top-3 right-3 bg-brand-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-brand-red transition-colors"
        >
          Editar
        </Link>
      )}
    </div>
  );
}
