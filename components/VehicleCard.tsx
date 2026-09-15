import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      href={`/estoque/${vehicle.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
  );
}
