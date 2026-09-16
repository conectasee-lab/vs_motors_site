import { createServerSupabaseClient } from "./supabase/server";

export type BodyType = {
  id: string;
  name: string;
};

export async function getBodyTypes(): Promise<BodyType[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("body_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(`Falha ao carregar carrocerias: ${error.message}`);
    return [];
  }
  return data as BodyType[];
}

export async function getBodyTypeById(id: string): Promise<BodyType | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("body_types")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar carroceria: ${error.message}`);
  return data as BodyType | null;
}
