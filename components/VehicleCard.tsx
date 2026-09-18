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
        <div className="relative w-full aspect-square bg-brand-black-soft overflow-hidden flex items-center justify-center p-3">
          <span className="absolute top-3 left-3 z-10 bg-brand-red text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
            {vehicle.year}
          </span>
          {vehicle.images.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.brand?.name ?? ""} ${vehicle.model}`.trim()}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
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
        <div className="p-4">
          <div className="flex items-center gap-2">
            {vehicle.brand?.logoUrl ? (
              <Image src={vehicle.brand.logoUrl} alt={vehicle.brand.name} width={32} height={32} className="object-contain shrink-0 rounded-full border border-gray-200" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
            )}
            <p className="text-brand-black font-bold text-base leading-tight truncate">
              {vehicle.brand?.name ?? vehicle.model}
            </p>
          </div>
          <p className="text-gray-600 text-sm font-semibold mt-2.5 truncate">
            {vehicle.model}
            {vehicle.bodyType && <span className="text-gray-400 font-normal"> · {vehicle.bodyType.name}</span>}
          </p>
          <div className="flex items-center gap-3 text-gray-500 text-sm mt-2">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path strokeLinecap="round" d="M3 9h18M8 3v4M16 3v4" />
              </svg>
              {vehicle.year}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
              </svg>
              {vehicle.km.toLocaleString("pt-BR")} km
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-brand-red font-bold text-lg">
              {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <span className="bg-brand-red text-white text-sm font-semibold px-4 py-1.5 rounded-full shrink-0">
              Ver mais
            </span>
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
