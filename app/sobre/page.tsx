export default function SobrePage() {
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
        <h2 className="text-3xl font-bold text-brand-black mb-6">Nossa História</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            A VS Motors nasceu do sonho de oferecer veículos de qualidade com
            transparência e confiança. Ao longo dos anos, construímos uma
            reputação sólida no mercado de veículos seminovos, sempre colocando
            o cliente em primeiro lugar.
          </p>
          <p>
            Cada carro do nosso estoque passa por uma criteriosa avaliação antes
            de chegar até você, garantindo procedência, qualidade mecânica e
            documentação em dia.
          </p>
          <p>
            Hoje, a VS Motors é referência para quem busca comprar ou vender um
            veículo com segurança e o melhor atendimento da região.
          </p>
        </div>
      </div>
    </div>
  );
}
