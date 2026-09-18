import { getCompanyContact } from "@/lib/company-contact";

export default async function ContatoPage() {
  const contact = await getCompanyContact();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <section className="relative h-[700px] flex items-center pt-16 pb-28 px-4 overflow-hidden bg-brand-black">
        {/* Hero background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/carros-seminovos-em-jundiai-Loja-Agencia-carro-veiculo-jundiai-02.png')" }}
          aria-hidden="true"
        />
        {/* Dark overlay for text legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.45) 55%, rgba(10,10,10,0.15) 75%, rgba(10,10,10,0.05) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
            O carro certo, revisado e pronto para rodar
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
            Em Jundiaí, cada veículo passa por inspeção antes de chegar até você.
            Negocie direto pelo WhatsApp, sem enrolação.
          </p>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-brand-black mb-6">Contato</h2>
        <div className="space-y-2 text-gray-700 mb-8">
          <p><span className="text-brand-gold">WhatsApp:</span> {contact.whatsapp}</p>
          <p><span className="text-brand-gold">E-mail:</span> {contact.email}</p>
          <p><span className="text-brand-gold">Endereço:</span> {contact.address}</p>
          <p><span className="text-brand-gold">Horário:</span> Segunda a sábado, 9h às 18h</p>
        </div>
      
      </div>
    </div>
  );
}
