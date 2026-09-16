import { createServerSupabaseClient } from "./supabase/server";

export type Accessory = {
  id: string;
  name: string;
};

export async function getAccessories(): Promise<Accessory[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accessories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(`Falha ao carregar acessórios: ${error.message}`);
    return [];
  }
  return data as Accessory[];
}

export async function getAccessoryById(id: string): Promise<Accessory | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accessories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar acessório: ${error.message}`);
  return data as Accessory | null;
}
