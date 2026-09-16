import type { Vehicle } from "@/lib/vehicles";

export default function WhatsAppButton({
  vehicle,
  phoneNumber,
}: {
  vehicle: Vehicle;
  phoneNumber: string;
}) {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no ${vehicle.brand?.name ? vehicle.brand.name + " " : ""}${vehicle.model} ${vehicle.year} anunciado no site da VS Motors.`
  );
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-brand-whatsapp text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
    >
      Falar no WhatsApp
    </a>
  );
}
