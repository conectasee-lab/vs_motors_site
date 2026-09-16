"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null };

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  file: File
): Promise<string> {
  const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from("brand-logos").upload(path, file);
  if (error) throw new Error(`Falha ao enviar logo: ${error.message}`);
  const { data } = supabase.storage.from("brand-logos").getPublicUrl(path);
  return data.publicUrl;
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

  const logo = formData.get("logo");
  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;

  const supabase = await createServerSupabaseClient();

  let logoUrl: string | null = null;
  if (logoFile) {
    try {
      logoUrl = await uploadLogo(supabase, logoFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao enviar logo.";
      return { error: message };
    }
  }

  const { error } = await supabase.from("brands").insert({ name, logo_url: logoUrl });
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
  return { error: null };
}

export async function updateBrandAction(
  id: string,
  currentLogoUrl: string | null,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome da marca." };

  const logo = formData.get("logo");
  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;

  const supabase = await createServerSupabaseClient();

  let logoUrl = currentLogoUrl;
  if (logoFile) {
    try {
      logoUrl = await uploadLogo(supabase, logoFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao enviar logo.";
      return { error: message };
    }
  }

  const { error } = await supabase.from("brands").update({ name, logo_url: logoUrl }).eq("id", id);
  if (error) return { error: friendlyInsertError(error.message) };

  revalidatePath("/admin/marcas");
  redirect("/admin/marcas");
  return { error: null };
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
  return { error: null };
}
