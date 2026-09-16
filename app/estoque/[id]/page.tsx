import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/vehicles-data";
import { getSessionUser } from "@/lib/auth";
import { getCompanyContact, whatsappDigits } from "@/lib/company-contact";
import WhatsAppButton from "@/components/WhatsAppButton";
import VehicleGallery from "@/components/VehicleGallery";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, user, contact] = await Promise.all([getVehicleById(id), getSessionUser(), getCompanyContact()]);
  if (!vehicle) notFound();
  const isLoggedIn = !!user;
  const title = `${vehicle.brand?.name ?? ""} ${vehicle.model}`.trim();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <VehicleGallery images={vehicle.images} alt={title} />

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-6">
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {vehicle.brand?.logoUrl ? (
                  <Image src={vehicle.brand.logoUrl} alt={vehicle.brand.name} width={44} height={44} className="object-contain shrink-0 rounded-full border border-gray-200" />
                ) : (
                  <span className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-brand-black leading-tight">
                    {vehicle.brand?.name ? `${vehicle.brand.name} ` : ""}
                    <span className="uppercase">{vehicle.model}</span>
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {vehicle.model} {vehicle.fuel} · {vehicle.color} · {vehicle.year}
                  </p>
                </div>
              </div>
              <p className="text-brand-red text-3xl font-bold whitespace-nowrap">
                {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>

            {isLoggedIn && (
              <Link
                href={`/estoque/${vehicle.id}/editar`}
                className="inline-block mt-4 text-sm font-semibold text-brand-black bg-brand-gold px-4 py-2 rounded hover:bg-brand-gold/80 transition-colors"
              >
                Editar
              </Link>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-5 mt-6">
              <h2 className="font-bold text-brand-black mb-4">Ficha técnica</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                <p className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                  <svg className="w-5 h-5 text-brand-red shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" />
                    <path strokeLinecap="round" d="M12 8v4l3 2" />
                  </svg>
                  {vehicle.transmission === "automatic" ? "Automático" : "Manual"}
                </p>
                <p className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                  <svg className="w-5 h-5 text-brand-red shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path strokeLinecap="round" d="M3 9h18M8 3v4M16 3v4" />
                  </svg>
                  {vehicle.year}
                </p>
                <p className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                  <svg className="w-5 h-5 text-brand-red shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                  </svg>
                  {vehicle.km.toLocaleString("pt-BR")} km
                </p>
                <p className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                  <svg className="w-5 h-5 text-brand-red shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  {vehicle.color}
                </p>
                <p className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                  <svg className="w-5 h-5 text-brand-red shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5Z" />
                  </svg>
                  {vehicle.fuel}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 mt-6">
              <h2 className="font-bold text-brand-black mb-3">+ Informações</h2>
              <p className="text-gray-700 whitespace-pre-line">{vehicle.description}</p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit space-y-3">
            <WhatsAppButton vehicle={vehicle} phoneNumber={whatsappDigits(contact.whatsapp)} />
            <p className="text-center text-sm text-gray-500">Onde estamos — VS Motors, Jundiaí</p>
          </div>
        </div>
      </div>
    </div>
  );
}
