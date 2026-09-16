"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null };

function friendlyInsertError(message: string): string {
  if (message.includes("duplicate key value") || message.includes("unique constraint")) {
    return "Já existe uma carroceria com esse nome.";
  }
  return `Falha ao salvar carroceria: ${message}`;
}

export async function createBodyTypeAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome da carroceria." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("body_types").insert({ name });
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/carrocerias");
  redirect("/admin/carrocerias");
}

export async function updateBodyTypeAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome da carroceria." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("body_types").update({ name }).eq("id", id);
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/carrocerias");
  redirect("/admin/carrocerias");
}

export async function deleteBodyTypeAction(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createServerSupabaseClient();

  const { count, error: countError } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("body_type_id", id);

  if (countError) return { error: `Falha ao verificar uso da carroceria: ${countError.message}` };
  if (count && count > 0) {
    return { error: `Carroceria em uso por ${count} veículo(s), remova o vínculo antes de excluir.` };
  }

  const { error } = await supabase.from("body_types").delete().eq("id", id);
  if (error) return { error: `Falha ao excluir carroceria: ${error.message}` };

  revalidatePath("/admin/carrocerias");
  redirect("/admin/carrocerias");
}
