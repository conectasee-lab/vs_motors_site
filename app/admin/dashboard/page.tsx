import { requireUser } from "@/lib/auth";
import {
  getEstoqueTotal,
  getVendasResumo,
  getEstoqueAgrupadoPorMarca,
  getEstoquePorMarcaParaGrafico,
  defaultAteDate,
} from "@/lib/dashboard-data";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardDateFilter from "@/components/dashboard/DashboardDateFilter";
import EstoquePorMarcaLista from "@/components/dashboard/EstoquePorMarcaLista";
import EstoquePorMarcaPizza from "@/components/dashboard/EstoquePorMarcaPizza";
import BackToEstoqueButton from "@/components/BackToEstoqueButton";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ate?: string }>;
}) {
  await requireUser();
  const { ate } = await searchParams;
  const ateDate = ate && /^\d{4}-\d{2}-\d{2}$/.test(ate) ? ate : defaultAteDate();

  const [estoqueTotal, vendasResumo, grupos, dadosGrafico] = await Promise.all([
    getEstoqueTotal(),
    getVendasResumo(ateDate),
    getEstoqueAgrupadoPorMarca(),
    getEstoquePorMarcaParaGrafico(),
  ]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-brand-black">Dashboard</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <DashboardDateFilter initialAte={ateDate} />
            <BackToEstoqueButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            label="Carros em Estoque"
            value={String(estoqueTotal)}
            accentColor="black"
            icon={<span>🚗</span>}
          />
          <MetricCard
            label="Carros Vendidos"
            value={String(vendasResumo.quantidade)}
            accentColor="green"
            icon={<span>✅</span>}
          />
          <MetricCard
            label="Faturamento"
            value={currencyFormatter.format(vendasResumo.faturamento)}
            accentColor="red"
            icon={<span>💰</span>}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-brand-black mb-4">Estoque por Marca e Modelo</h2>
            <EstoquePorMarcaLista grupos={grupos} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-brand-black mb-4">Estoque por Marca</h2>
            <EstoquePorMarcaPizza dados={dadosGrafico} />
          </div>
        </div>
      </div>
    </div>
  );
}
