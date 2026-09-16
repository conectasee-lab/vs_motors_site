import { createServerSupabaseClient } from "./supabase/server";

export type Brand = {
  id: string;
  name: string;
  logoUrl: string | null;
};

type BrandRow = {
  id: string;
  name: string;
  logo_url: string | null;
};

function toBrand(row: BrandRow): Brand {
  return { id: row.id, name: row.name, logoUrl: row.logo_url };
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(`Falha ao carregar marcas: ${error.message}`);
    return [];
  }
  return (data as BrandRow[]).map(toBrand);
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar marca: ${error.message}`);
  return data ? toBrand(data as BrandRow) : null;
}
