import Image from "next/image";

export default function SobrePage() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Image
        src="/carros-seminovos-em-jundiai-Loja-Agencia-carro-veiculo-jundiai-01.png"
        alt="Loja da VS Motors, revenda de carros seminovos em Jundiaí"
        width={1910}
        height={823}
        className="w-full h-auto"
        priority
      />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-brand-black mb-6">Nossa História</h1>
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
