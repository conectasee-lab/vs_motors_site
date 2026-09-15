import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
