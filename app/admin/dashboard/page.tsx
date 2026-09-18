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
    <div className="min-h-screen w-full bg-dash-surface">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4 pb-6 border-b border-dash-line">
          <div>
            <h1 className="text-2xl font-medium text-dash-ink">Dashboard</h1>
            <p className="text-sm text-dash-muted mt-1">Visão geral do estoque e das vendas</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DashboardDateFilter initialAte={ateDate} />
            <BackToEstoqueButton />
          </div>
        </div>

        <div className="mb-4">
          <MetricCard
            label="Faturamento no período"
            value={currencyFormatter.format(vendasResumo.faturamento)}
            caption={`${vendasResumo.quantidade} ${vendasResumo.quantidade === 1 ? "carro vendido" : "carros vendidos"}`}
            accent="red"
            variant="hero"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <MetricCard label="Carros em estoque" value={String(estoqueTotal)} accent="steel" />
          <MetricCard label="Vendidos no período" value={String(vendasResumo.quantidade)} accent="muted" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dash-panel border border-dash-line rounded-sm p-6">
            <h2 className="text-base font-medium text-dash-ink mb-4">Estoque por marca e modelo</h2>
            <EstoquePorMarcaLista grupos={grupos} />
          </div>
          <div className="bg-dash-panel border border-dash-line rounded-sm p-6">
            <h2 className="text-base font-medium text-dash-ink mb-4">Distribuição por marca</h2>
            <EstoquePorMarcaPizza dados={dadosGrafico} />
          </div>
        </div>
      </div>
    </div>
  );
}
