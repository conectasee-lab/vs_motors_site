"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null; success: boolean };

export async function updateCompanyContactAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const instagramUrl = String(formData.get("instagram_url") ?? "").trim();
  const facebookUrl = String(formData.get("facebook_url") ?? "").trim();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("company_contact")
    .update({
      whatsapp,
      email,
      address,
      instagram_url: instagramUrl,
      facebook_url: facebookUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { error: `Falha ao salvar dados de contato: ${error.message}`, success: false };

  revalidatePath("/admin/contato");
  revalidatePath("/contato");
  revalidatePath("/", "layout");
  return { error: null, success: true };
}
