export default function SobrePage() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <section className="relative h-[700px] flex items-center pt-16 pb-28 px-4 overflow-hidden bg-brand-black">
        {/* Hero background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/carros-seminovos-em-jundiai-Loja-Agencia-carro-veiculo-jundiai-01.png')" }}
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
            Conheça a história da Vs Motors.
            Loja e Agência de Veículos em Jundiái.

          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
            Carros Seminovos e Usados em Jundiaí e Região.</p>
            <p>
            As Melhores Ofertas.
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
            E você está pesquisando as melhores lojas de carros em Jundiaí, encontrou a
            agência de veículos ideal para realizar o seu negócio. Nossa revenda conta 
            com um estoque completo e rigorosamente periciado de carros seminovos em Jundiaí, 
            atendendo também clientes de Várzea Paulista, Campo Limpo Paulista, Itupeva, Louveira, Vinhedo entre 
            outras regiões.
          </p>
          <p>
            <b>Por que escolher nossa revenda de veículos em Jundiaí? </b>
            Comprar um carro seminovo em Jundiaí exige procedência, transparência e as melhores condições de pagamento 
            do mercado. Em nosso estacionamento de carros em Jundiaí, você encontra:
          </p>
        </div>
      </div>
    </div>
  );
}
