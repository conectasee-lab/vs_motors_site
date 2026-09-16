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
    <div className="group relative block bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-brand-black transition-colors duration-200">
      <Link href={`/estoque/${vehicle.id}`} className="block">
        <div className="relative w-full h-52 bg-brand-black-soft overflow-hidden flex items-center justify-center">
          {vehicle.images.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.brand?.name ?? ""} ${vehicle.model}`.trim()}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <svg
              viewBox="0 0 64 32"
              className="w-24 h-auto text-white/15 group-hover:text-brand-red/25 transition-colors duration-300"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 22c-3 0-5-2-5-5s2-5 5-5l4-8c1-2 3-3 5-3h18c2 0 4 1 5 3l4 8c3 0 5 2 5 5s-2 5-5 5H6Zm6-14-2 5h10l-2-5H12Zm14 0-2 5h14l-3-5H26Z" />
            </svg>
          )}
        </div>
        <div className="p-5">
          <p className="text-brand-black font-bold text-lg flex items-center gap-2">
            {vehicle.brand?.logoUrl && (
              <Image src={vehicle.brand.logoUrl} alt={vehicle.brand.name} width={20} height={20} className="object-contain shrink-0" />
            )}
            {vehicle.brand?.name ? `${vehicle.brand.name} ` : ""}{vehicle.model}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {vehicle.year} · {vehicle.km.toLocaleString("pt-BR")} km
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-brand-red font-bold text-xl">
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
