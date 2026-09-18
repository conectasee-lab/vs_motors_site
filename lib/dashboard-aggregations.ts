export type SoldVehicleRow = { price: number };

export function sumRevenue(rows: SoldVehicleRow[]): number {
  return rows.reduce((total, row) => total + row.price, 0);
}

export type StockVehicleRow = { id: string; model: string; year: number; brandName: string };
export type MarcaGroup = { marca: string; veiculos: { id: string; model: string; year: number }[] };

export function groupByBrand(rows: StockVehicleRow[]): MarcaGroup[] {
  const groups = new Map<string, MarcaGroup["veiculos"]>();
  for (const row of rows) {
    const existing = groups.get(row.brandName);
    const veiculo = { id: row.id, model: row.model, year: row.year };
    if (existing) {
      existing.push(veiculo);
    } else {
      groups.set(row.brandName, [veiculo]);
    }
  }
  return Array.from(groups.entries())
    .map(([marca, veiculos]) => ({ marca, veiculos }))
    .sort((a, b) => a.marca.localeCompare(b.marca, "pt-BR"));
}

export type MarcaCount = { marca: string; quantidade: number };

export function countByBrand(rows: StockVehicleRow[]): MarcaCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.brandName, (counts.get(row.brandName) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([marca, quantidade]) => ({ marca, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade || a.marca.localeCompare(b.marca, "pt-BR"));
}
