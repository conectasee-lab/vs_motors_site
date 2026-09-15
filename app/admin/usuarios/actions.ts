"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type ActionResult = { error: string | null };

export async function createEmployeeAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) return { error: "Informe o e-mail do funcionário." };
  if (password.length < 8) return { error: "A senha deve ter no mínimo 8 caracteres." };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return { error: `Falha ao criar funcionário: ${error.message}` };

  revalidatePath("/admin/usuarios");
  return { error: null };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!userId) return { error: "Usuário inválido." };
  if (password.length < 8) return { error: "A senha deve ter no mínimo 8 caracteres." };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { password });

  if (error) return { error: `Falha ao redefinir senha: ${error.message}` };

  revalidatePath("/admin/usuarios");
  return { error: null };
}
