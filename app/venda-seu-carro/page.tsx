import type { Metadata } from "next";
import { getCompanyContact, whatsappDigits } from "@/lib/company-contact";
import SellCarForm from "@/components/SellCarForm";

export const metadata: Metadata = {
  title: "Venda seu carro em Jundiaí | VS Motors",
  description:
    "Venda na hora, troque com troco ou consigne seu carro na VS Motors. Peça uma avaliação sem compromisso pelo WhatsApp.",
};

const STEPS = [
  { title: "Você envia os dados", text: "Marca, modelo, ano e quilometragem. Leva um minuto." },
  { title: "Avaliamos o carro", text: "Comparamos com o mercado e respondemos no WhatsApp em horário comercial." },
  { title: "Você decide", text: "Se a proposta servir, marcamos uma vistoria rápida na loja. Se não, sem compromisso." },
];

export default async function VendaSeuCarroPage() {
  const contact = await getCompanyContact();
  const phone = whatsappDigits(contact.whatsapp);

  return (
    <div className="font-sans w-full bg-[#eceef0]">
      <section className="relative flex items-center min-h-[700px] pt-16 pb-28 px-4 overflow-hidden bg-brand-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/carros-seminovos-em-jundiai-Loja-Agencia-carro-veiculo-jundiai-03.png')" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.45) 55%, rgba(10,10,10,0.15) 75%, rgba(10,10,10,0.05) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="max-w-xl text-center md:text-left mx-auto md:mx-0">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-[1.05] tracking-tight">
              Quanto vale o seu carro?
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Peça uma avaliação sem compromisso. Você escolhe se quer vender na hora, trocar ou consignar.
            </p>
            <a
              href="#avaliacao"
              className="inline-block bg-brand-red hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Pedir avaliação
            </a>
          </div>
        </div>
      </section>

      <div
        id="avaliacao"
        className="max-w-6xl mx-auto px-4 py-12 md:py-20 grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] items-start scroll-mt-20"
      >
        <div className="lg:sticky lg:top-24">
          <h2 className="text-3xl font-bold text-brand-black mb-8 leading-tight">Do pedido à proposta em um dia útil</h2>
          <ol className="relative space-y-8 border-l-2 border-brand-red/25 pl-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span
                  className="absolute -left-[calc(2rem+1px)] top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-brand-red text-sm font-bold text-white tabular-nums"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="font-bold text-brand-black mb-1">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white rounded-xl p-6 md:p-10">
          <SellCarForm phone={phone} />
        </div>
      </div>
    </div>
  );
}
