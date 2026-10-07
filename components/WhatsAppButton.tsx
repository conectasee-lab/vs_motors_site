import type { Vehicle } from "@/lib/vehicles";
import TrackedLink from "@/components/TrackedLink";

export default function WhatsAppButton({
  vehicle,
  phoneNumber,
}: {
  vehicle: Vehicle;
  phoneNumber: string;
}) {
  const vehicleName = `${vehicle.brand?.name ? vehicle.brand.name + " " : ""}${vehicle.model} ${vehicle.year}`;
  const message = encodeURIComponent(
    `Olá! Tenho interesse no ${vehicleName} anunciado no site da VS Motors.`
  );
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <TrackedLink
      href={href}
      metaEvent="Contact"
      metaParams={{
        content_name: vehicleName,
        content_ids: [vehicle.id],
        content_type: "vehicle",
        value: vehicle.price,
        currency: "BRL",
      }}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-brand-whatsapp text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
    >
      Falar no WhatsApp
    </TrackedLink>
  );
}
