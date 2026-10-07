"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isBucketPublicUrl } from "@/lib/storage";

type ActionResult = { error: string | null };

/** Logo URL the browser already uploaded to the "brand-logos" bucket, if any. */
function parseLogoUrl(formData: FormData): { url: string | null; error: string | null } {
  const url = String(formData.get("logo_url") ?? "").trim();
  if (!url) return { url: null, error: null };
  if (!isBucketPublicUrl(url, "brand-logos")) return { url: null, error: "Logo inválida." };
  return { url, error: null };
}

function friendlyInsertError(message: string): string {
  if (message.includes("duplicate key value") || message.includes("unique constraint")) {
    return "Já existe uma marca com esse nome.";
  }
  return `Falha ao salvar marca: ${message}`;
}

export async function createBrandAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome da marca." };

  const logo = parseLogoUrl(formData);
  if (logo.error) return { error: logo.error };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("brands").insert({ name, logo_url: logo.url });
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}

export async function updateBrandAction(
  id: string,
  currentLogoUrl: string | null,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome da marca." };

  const logo = parseLogoUrl(formData);
  if (logo.error) return { error: logo.error };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("brands").update({ name, logo_url: logo.url ?? currentLogoUrl }).eq("id", id);
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}

export async function deleteBrandAction(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createServerSupabaseClient();

  const { count, error: countError } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id);

  if (countError) return { error: `Falha ao verificar uso da marca: ${countError.message}` };
  if (count && count > 0) {
    return { error: `Marca em uso por ${count} veículo(s), remova o vínculo antes de excluir.` };
  }

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { error: `Falha ao excluir marca: ${error.message}` };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
}
