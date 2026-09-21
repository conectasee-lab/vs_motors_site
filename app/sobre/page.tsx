import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre a VS Motors | Loja de carros seminovos em Jundiaí",
  description:
    "Conheça a VS Motors, loja e agência de veículos em Jundiaí. Carros seminovos revisados, atendimento direto e condições de pagamento facilitadas para Jundiaí e região.",
};

const REASONS = [
  {
    title: "Revisado antes da venda",
    text: "Inspeção mecânica e de procedência em todo veículo do estoque.",
  },
  {
    title: "Entrada facilitada",
    text: "Condições de pagamento e financiamento pensadas para caber no seu orçamento.",
  },
  {
    title: "Conversa direta",
    text: "Cada anúncio abre uma conversa no WhatsApp com o vendedor, sem intermediários.",
  },
  {
    title: "Estoque sempre girando",
    text: "Novos veículos entram toda semana. Volte com frequência.",
  },
  {
    title: "Aceitamos o seu carro",
    text: "Compramos na hora, fazemos troca com troco ou vendemos por consignação.",
  },
];

const CITIES = [
  "Jundiaí",
  "Várzea Paulista",
  "Campo Limpo Paulista",
  "Itupeva",
  "Louveira",
  "Vinhedo",
];

export default function SobrePage() {
  return (
    <div className="font-sans w-full bg-[#eceef0]">
      <section className="relative flex items-end min-h-[700px] pt-24 pb-16 px-4 overflow-hidden bg-brand-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/carros-seminovos-em-jundiai-Loja-Agencia-carro-veiculo-jundiai-01.png')" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 35%, rgba(10,10,10,0.2) 70%, rgba(10,10,10,0.1) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="relative w-full max-w-6xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-[0.95] tracking-tighter max-w-4xl mb-6">
            Carro bom se vende com a cara limpa.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
            VS Motors, loja e agência de veículos em Jundiaí. Carros seminovos e usados, com as melhores ofertas da região.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-black leading-[1.05] tracking-tight">
            Nascemos do sonho de vender carro com confiança.
          </h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed max-w-prose">
            <p>
              A VS Motors nasceu do sonho de oferecer veículos de qualidade com transparência e confiança. Ao longo
              dos anos, construímos uma reputação sólida no mercado de veículos seminovos, sempre colocando o cliente
              em primeiro lugar.
            </p>
            <p>
              Se você está pesquisando pesquisando as melhores lojas de carros em Jundiaí, encontrou a agência de veículos
              ideal para realizar o seu negócio. Nossa revenda conta com um estoque completo e rigorosamente periciado de 
              carros seminovos em Jundiaí, atendendo também clientes de Várzea Paulista, Campo Limpo Paulista, Itupeva, Louveira,
              Vinhedo entre outras regiões. seminovos.
            </p>
            <p>
              Por que escolher nossa revenda de veículos em Jundiaí? Comprar um carro seminovo em Jundiaí exige procedência, transparência
              e as melhores condições de pagamento do mercado. Em nosso estacionamento de carros em Jundiaí, você encontra:
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-black px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.05] tracking-tight max-w-3xl mb-12">
            Por que escolher nossa revenda de veículos em Jundiaí
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mb-12 leading-relaxed">
            Comprar um carro seminovo exige procedência, transparência e boas condições de pagamento. No nosso
            estacionamento você encontra:
          </p>
          <dl className="border-t border-white/15">
            {REASONS.map((r) => (
              <div
                key={r.title}
                className="grid gap-2 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-20 border-b border-white/15 py-7"
              >
                <dt className="text-2xl md:text-3xl font-bold text-white tracking-tight">{r.title}</dt>
                <dd className="text-gray-400 text-lg leading-relaxed max-w-prose">{r.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-brand-black mb-8 max-w-xl">
            Atendemos Jundiaí e região, inclusive clientes de:
          </h2>
          <ul className="font-bold tracking-tighter leading-[0.95] text-brand-black">
            {CITIES.map((city, i) => (
              <li
                key={city}
                className={i === 0 ? "text-6xl sm:text-8xl md:text-[9rem] text-brand-red" : "text-4xl sm:text-6xl md:text-7xl"}
                style={i === 0 ? undefined : { opacity: 1 - i * 0.13 }}
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-brand-red px-4 py-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Vem ver o seu próximo carro.</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/estoque"
              className="bg-white text-brand-black font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver o estoque
            </Link>
            <Link
              href="/contato"
              className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Falar com a loja
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
