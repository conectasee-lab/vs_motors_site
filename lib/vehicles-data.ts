import { createServerSupabaseClient } from "./supabase/server";
import type { Vehicle } from "./vehicles";

type VehicleRow = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: "manual" | "automatic";
  fuel: string;
  color: string;
  images: string[];
  description: string;
};

function toVehicle(row: VehicleRow): Vehicle {
  return { ...row };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao carregar estoque: ${error.message}`);
  return (data as VehicleRow[]).map(toVehicle);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar veículo: ${error.message}`);
  return data ? toVehicle(data as VehicleRow) : null;
}
