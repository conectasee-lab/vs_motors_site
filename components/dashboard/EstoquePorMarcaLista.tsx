import type { MarcaGroup } from "@/lib/dashboard-aggregations";

const AVATAR_COLORS = [
  "bg-dash-chip-red text-brand-red",
  "bg-dash-chip-blue text-indigo-600",
  "bg-dash-chip-slate text-dash-ink",
];

export default function EstoquePorMarcaLista({ grupos }: { grupos: MarcaGroup[] }) {
  if (grupos.length === 0) {
    return <p className="text-dash-muted text-sm">Nenhum veículo em estoque.</p>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {grupos.map((grupo, index) => (
        <div key={grupo.marca} className="bg-dash-surface rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${
                AVATAR_COLORS[index % AVATAR_COLORS.length]
              }`}
            >
              {grupo.marca.slice(0, 2).toUpperCase()}
            </span>
            <span className="flex-1 text-sm font-medium text-dash-ink">{grupo.marca}</span>
            <span className="text-xs font-medium text-dash-muted bg-white rounded-full px-2.5 py-1">
              {grupo.veiculos.length}
            </span>
          </div>
          <ul className="mt-2 pl-12 space-y-1">
            {grupo.veiculos.map((v) => (
              <li key={v.id} className="text-sm text-dash-muted">
                {v.model} ({v.year})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
