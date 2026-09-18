import type { MarcaGroup } from "@/lib/dashboard-aggregations";

export default function EstoquePorMarcaLista({ grupos }: { grupos: MarcaGroup[] }) {
  if (grupos.length === 0) {
    return <p className="text-dash-muted text-sm">Nenhum veículo em estoque.</p>;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {grupos.map((grupo) => (
        <div key={grupo.marca} className="border-b border-dash-line last:border-b-0 py-3 first:pt-0">
          <div className="flex items-baseline justify-between">
            <p className="font-medium text-dash-ink">{grupo.marca}</p>
            <p
              className="text-sm text-dash-muted tabular-nums"
              style={{ fontFamily: "var(--font-dash-numeric)" }}
            >
              {grupo.veiculos.length}
            </p>
          </div>
          <ul>
            {grupo.veiculos.map((v) => (
              <li key={v.id} className="text-sm text-dash-muted py-0.5">
                {v.model} ({v.year})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
