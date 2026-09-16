import { createServerSupabaseClient } from "./supabase/server";
import type { Vehicle } from "./vehicles";

type VehicleRow = {
  id: string;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: "manual" | "automatic";
  fuel: string;
  color: string;
  images: string[];
  description: string;
  brand: { id: string; name: string; logo_url: string | null } | null;
};

function toVehicle(row: VehicleRow): Vehicle {
  const { brand, ...rest } = row;
  return {
    ...rest,
    brand: brand ? { id: brand.id, name: brand.name, logoUrl: brand.logo_url } : null,
  };
}

const SELECT_WITH_BRAND = "*, brand:brands(id, name, logo_url)";

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_BRAND)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Falha ao carregar estoque: ${error.message}`);
    return [];
  }
  return (data as unknown as VehicleRow[]).map(toVehicle);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_BRAND)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar veículo: ${error.message}`);
  return data ? toVehicle(data as unknown as VehicleRow) : null;
}
