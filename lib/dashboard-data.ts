import { cache } from "react";
import { createServerSupabaseClient } from "./supabase/server";
import { sumRevenue, groupByBrand, countByBrand, type StockVehicleRow } from "./dashboard-aggregations";

export function defaultAteDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultDeDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function nextDayString(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function getEstoqueTotal(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase.from("vehicles").select("id", { count: "exact", head: true });
  if (error) {
    console.error(`Falha ao contar estoque: ${error.message}`);
    return 0;
  }
  return count ?? 0;
}

export async function getVendasResumo(
  deDate: string = defaultDeDate(),
  ateDate: string = defaultAteDate()
): Promise<{ quantidade: number; faturamento: number }> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sold_vehicles")
    .select("price")
    .gte("sold_at", deDate)
    .lt("sold_at", nextDayString(ateDate));

  if (error) {
    console.error(`Falha ao carregar vendas: ${error.message}`);
    return { quantidade: 0, faturamento: 0 };
  }
  const rows = data ?? [];
  return { quantidade: rows.length, faturamento: sumRevenue(rows) };
}

type StockRowWithBrand = { id: string; model: string; year: number; brand: { name: string } | null };

const fetchStockWithBrand = cache(async (): Promise<StockVehicleRow[]> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("vehicles").select("id, model, year, brand:brands(name)");
  if (error) {
    console.error(`Falha ao carregar estoque por marca: ${error.message}`);
    return [];
  }
  return (data as unknown as StockRowWithBrand[]).map((row) => ({
    id: row.id,
    model: row.model,
    year: row.year,
    brandName: row.brand?.name ?? "Sem marca",
  }));
});

export async function getEstoqueAgrupadoPorMarca() {
  return groupByBrand(await fetchStockWithBrand());
}

export async function getEstoquePorMarcaParaGrafico() {
  return countByBrand(await fetchStockWithBrand());
}
