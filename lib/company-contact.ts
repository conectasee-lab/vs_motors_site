import { createServerSupabaseClient } from "./supabase/server";

export type CompanyContact = {
  whatsapp: string;
  email: string;
  address: string;
};

const FALLBACK_CONTACT: CompanyContact = {
  whatsapp: "(00) 90000-0000",
  email: "contato@vsmotors.com.br",
  address: "Av. Quatorze de Dezembro, 1300 - Vila Mafalda, Jundiaí - SP, 13206-105",
};

type CompanyContactRow = {
  whatsapp: string;
  email: string;
  address: string;
};

export async function getCompanyContact(): Promise<CompanyContact> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("company_contact")
    .select("whatsapp, email, address")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error(`Falha ao carregar dados de contato: ${error.message}`);
    return FALLBACK_CONTACT;
  }
  if (!data) return FALLBACK_CONTACT;

  const row = data as CompanyContactRow;
  return {
    whatsapp: row.whatsapp || FALLBACK_CONTACT.whatsapp,
    email: row.email || FALLBACK_CONTACT.email,
    address: row.address || FALLBACK_CONTACT.address,
  };
}

/** Digits-only phone for the wa.me link, prefixed with Brazil's country code (55) unless already present. */
export function whatsappDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}
