import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      href={`/estoque/${vehicle.id}`}
      className="block bg-brand-black-soft border border-brand-gold/20 rounded-lg overflow-hidden hover:border-brand-red transition-colors"
    >
      <div className="relative w-full h-48 bg-black">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="text-white font-semibold">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-gray-400 text-sm">
          {vehicle.year} · {vehicle.km.toLocaleString("pt-BR")} km
        </p>
        <p className="text-brand-red font-bold text-lg mt-2">
          {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
    </Link>
  );
}
