import Link from "next/link";
import { getVehicles } from "@/lib/vehicles-data";
import VehicleCard from "@/components/VehicleCard";

export default async function HomePage() {
  const vehicles = await getVehicles();
  const highlights = vehicles.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-brand-black pt-16 pb-28 px-4 overflow-hidden">
        <svg
          viewBox="0 0 64 32"
          className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 w-[38rem] h-auto text-white/[0.04]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 22c-3 0-5-2-5-5s2-5 5-5l4-8c1-2 3-3 5-3h18c2 0 4 1 5 3l4 8c3 0 5 2 5 5s-2 5-5 5H6Zm6-14-2 5h10l-2-5H12Zm14 0-2 5h14l-3-5H26Z" />
        </svg>

        <div className="relative max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
              O carro certo, revisado e pronto para rodar
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              Em Jundiaí, cada veículo passa por inspeção antes de chegar até você.
              Negocie direto pelo WhatsApp, sem enrolação.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-2xl shadow-black/40">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar marca ou modelo — ex: Corolla, Onix"
                className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
              <Link
                href="/estoque"
                className="bg-brand-red hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center"
              >
                Buscar veículo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100 py-14 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="flex gap-4 items-start">
            <svg className="w-7 h-7 text-brand-red shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
            </svg>
            <div>
              <h3 className="font-bold text-brand-black mb-1">Revisado antes da venda</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Inspeção mecânica e de procedência em todo veículo do estoque.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <svg className="w-7 h-7 text-brand-red shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5Z" />
            </svg>
            <div>
              <h3 className="font-bold text-brand-black mb-1">Fala direto com a gente</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Cada anúncio abre uma conversa no WhatsApp com o vendedor, sem intermediários.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <svg className="w-7 h-7 text-brand-red shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h1l2-5h12l2 5h1v5h-2v-2H5v2H3v-5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 16.5h.01M17.5 16.5h.01" />
            </svg>
            <div>
              <h3 className="font-bold text-brand-black mb-1">Estoque sempre girando</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Novos veículos entram toda semana — volte com frequência.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-brand-black mb-2">Destaques do estoque</h2>
              <p className="text-gray-600">Alguns dos veículos disponíveis agora em Jundiaí</p>
            </div>
            <Link
              href="/estoque"
              className="text-brand-red font-semibold hover:text-red-700 transition-colors"
            >
              Ver todo o estoque
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-black py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Quer vender o seu carro?</h2>
          <p className="text-gray-400 mb-8 text-lg">Conta pra gente o modelo e o estado — respondemos com uma avaliação sem compromisso.</p>
          <Link
            href="/venda-seu-carro"
            className="inline-block bg-brand-red hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Solicitar avaliação
          </Link>
        </div>
      </section>
    </div>
  );
}
