import type { MarcaGroup } from "@/lib/dashboard-aggregations";

export default function EstoquePorMarcaLista({ grupos }: { grupos: MarcaGroup[] }) {
  if (grupos.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum veículo em estoque.</p>;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {grupos.map((grupo) => (
        <div key={grupo.marca}>
          <p className="font-semibold text-brand-black mb-1">{grupo.marca}</p>
          <ul className="space-y-1 pl-3">
            {grupo.veiculos.map((v) => (
              <li key={v.id} className="text-sm text-gray-600">
                {v.model} ({v.year})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
