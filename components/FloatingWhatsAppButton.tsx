import { getCompanyContact, whatsappDigits } from "@/lib/company-contact";

export default async function FloatingWhatsAppButton() {
  const contact = await getCompanyContact();
  const phone = whatsappDigits(contact.whatsapp);
  if (!phone) return null;

  const message = encodeURIComponent("Olá! Gostaria de mais informações sobre os veículos da VS Motors.");
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-whatsapp text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.66 4.53 1.8 6.39L4 29l7.8-1.75A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.7c-1.99 0-3.86-.55-5.46-1.5l-.39-.23-4.63 1.04 1.02-4.51-.25-.4A9.68 9.68 0 0 1 6.3 15c0-5.35 4.35-9.7 9.7-9.7 5.36 0 9.7 4.35 9.7 9.7s-4.34 9.7-9.7 9.7Zm5.32-7.27c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.19.29-.75.95-.92 1.15-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.56c-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.02c.15.19 2.06 3.14 5 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.11.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z" />
      </svg>
    </a>
  );
}
