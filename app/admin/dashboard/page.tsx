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
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-dash-ink">Dashboard</h1>
            <p className="text-sm text-dash-muted mt-1">Visão geral do estoque e das vendas</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DashboardDateFilter initialAte={ateDate} />
            <BackToEstoqueButton />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <MetricCard
            label="Faturamento no período"
            value={currencyFormatter.format(vendasResumo.faturamento)}
            caption={`${vendasResumo.quantidade} ${vendasResumo.quantidade === 1 ? "carro vendido" : "carros vendidos"}`}
            accent="red"
            variant="dark"
            icon={<CurrencyIcon />}
          />
          <MetricCard
            label="Carros em estoque"
            value={String(estoqueTotal)}
            accent="blue"
            icon={<CarIcon />}
          />
          <MetricCard
            label="Vendidos no período"
            value={String(vendasResumo.quantidade)}
            accent="slate"
            icon={<CheckIcon />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-dash-panel rounded-[20px] p-6 shadow-[0_8px_24px_-12px_rgba(27,35,64,0.1)]">
            <h2 className="text-base font-semibold text-dash-ink mb-4">Estoque por marca e modelo</h2>
            <EstoquePorMarcaLista grupos={grupos} />
          </div>
          <div className="bg-dash-panel rounded-[20px] p-6 shadow-[0_8px_24px_-12px_rgba(27,35,64,0.1)]">
            <h2 className="text-base font-semibold text-dash-ink mb-4">Distribuição por marca</h2>
            <EstoquePorMarcaPizza dados={dadosGrafico} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrencyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5.9 2.5 2c0 1.4-1.1 1.8-2.5 2.5S9.5 12.6 9.5 14c0 1.1 1.1 2 2.5 2s2.5-1.1 2.5-2.5" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path d="M4 16V11l1.6-4.2A2 2 0 0 1 7.5 5.5h9a2 2 0 0 1 1.9 1.3L20 11v5" />
      <path d="M4 16h16v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z" />
      <circle cx="7.5" cy="16" r="1.3" />
      <circle cx="16.5" cy="16" r="1.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.2 2.2 4.8-4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
