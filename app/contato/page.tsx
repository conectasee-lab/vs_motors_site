import { getCompanyContact } from "@/lib/company-contact";

export default async function ContatoPage() {
  const contact = await getCompanyContact();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-brand-black mb-6">Contato</h1>
        <div className="space-y-2 text-gray-700 mb-8">
          <p><span className="text-brand-gold">WhatsApp:</span> {contact.whatsapp}</p>
          <p><span className="text-brand-gold">E-mail:</span> {contact.email}</p>
          <p><span className="text-brand-gold">Endereço:</span> {contact.address}</p>
          <p><span className="text-brand-gold">Horário:</span> Segunda a sábado, 9h às 18h</p>
        </div>
        <div className="w-full h-64 bg-white border border-brand-gold/20 rounded-lg flex items-center justify-center text-gray-500">
          Mapa (placeholder)
        </div>
      </div>
    </div>
  );
}
