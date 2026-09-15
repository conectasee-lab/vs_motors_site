import Link from "next/link";
import { vehicles } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";

export default function HomePage() {
  const highlights = vehicles.slice(0, 3);

  return (
    <div>
      {/* Hero com Search como foco */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-blue-300 text-sm font-medium tracking-wide mb-3">ENCONTRE SEU PRÓXIMO CARRO</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Qualidade e confiança em cada veículo
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Seleção cuidada de veículos revisados. Atendimento personalizado. Sua satisfação é nossa prioridade.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar marca ou modelo"
                className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <Link
                href="/estoque"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center"
              >
                Buscar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="text-3xl">✓</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Veículos Revisados</h3>
                <p className="text-sm text-gray-600">Procedência garantida e inspeção completa</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="text-3xl">💬</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Atendimento Direto</h3>
                <p className="text-sm text-gray-600">Suporte via WhatsApp em cada anúncio</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="text-3xl">🚗</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Estoque Atualizado</h3>
                <p className="text-sm text-gray-600">Novos veículos agregados constantemente</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Destaques do Estoque</h2>
            <p className="text-gray-600">Confira alguns dos melhores veículos disponíveis agora</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/estoque"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-lg transition-colors"
            >
              Ver todo o estoque
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-orange-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Quer vender seu carro?</h2>
          <p className="text-blue-100 mb-8 text-lg">Receba uma avaliação sem compromisso</p>
          <Link
            href="/venda-seu-carro"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Solicitar Avaliação
          </Link>
        </div>
      </section>
    </div>
  );
}
