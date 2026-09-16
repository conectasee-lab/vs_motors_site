"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null };

function friendlyInsertError(message: string): string {
  if (message.includes("duplicate key value") || message.includes("unique constraint")) {
    return "Já existe um acessório com esse nome.";
  }
  return `Falha ao salvar acessório: ${message}`;
}

export async function createAccessoryAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do acessório." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("accessories").insert({ name });
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/acessorios");
  redirect("/admin/acessorios");
}

export async function updateAccessoryAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do acessório." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("accessories").update({ name }).eq("id", id);
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/acessorios");
  redirect("/admin/acessorios");
}

export async function deleteAccessoryAction(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createServerSupabaseClient();

  const { count, error: countError } = await supabase
    .from("vehicle_accessories")
    .select("vehicle_id", { count: "exact", head: true })
    .eq("accessory_id", id);

  if (countError) return { error: `Falha ao verificar uso do acessório: ${countError.message}` };
  if (count && count > 0) {
    return { error: `Acessório em uso por ${count} veículo(s), remova o vínculo antes de excluir.` };
  }

  const { error } = await supabase.from("accessories").delete().eq("id", id);
  if (error) return { error: `Falha ao excluir acessório: ${error.message}` };

  revalidatePath("/admin/acessorios");
  redirect("/admin/acessorios");
}
