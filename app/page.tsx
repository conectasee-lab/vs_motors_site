import Link from "next/link";
import { vehicles } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";

export default function HomePage() {
  const highlights = vehicles.slice(0, 3);

  return (
    <div>
      <section className="bg-brand-black-soft border-b border-brand-gold/30 py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Encontre o carro <span className="text-brand-red">ideal</span> para você
        </h1>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          A VS Motors une qualidade, confiança e os melhores veículos revisados
          da região.
        </p>
        <Link
          href="/estoque"
          className="inline-block bg-brand-red text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Ver Estoque
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white mb-6">Destaques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      <section className="bg-brand-black-soft border-t border-brand-gold/30 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Por que a VS Motors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <p><span className="text-brand-gold font-semibold block mb-1">Confiança</span>Veículos revisados e com procedência garantida.</p>
            <p><span className="text-brand-gold font-semibold block mb-1">Variedade</span>Estoque atualizado com opções para todo perfil.</p>
            <p><span className="text-brand-gold font-semibold block mb-1">Atendimento</span>Suporte direto via WhatsApp em cada anúncio.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
