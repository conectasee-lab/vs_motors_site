"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MAX_PHOTOS_PER_VEHICLE, orderImagesWithFeatured } from "@/lib/vehicle-photos";
import { isBucketPublicUrl } from "@/lib/storage";

type ActionResult = { error: string | null };

function parseVehicleFields(formData: FormData) {
  const brandId = String(formData.get("brand_id") ?? "").trim();
  const bodyTypeId = String(formData.get("body_type_id") ?? "").trim();
  return {
    brand_id: brandId || null,
    body_type_id: bodyTypeId || null,
    model: String(formData.get("model") ?? "").trim(),
    year: Number(formData.get("year")),
    price: Number(formData.get("price")),
    km: Number(formData.get("km")),
    transmission: String(formData.get("transmission") ?? ""),
    fuel: String(formData.get("fuel") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };
}

function parseAccessoryIds(formData: FormData): string[] {
  return formData.getAll("accessory_ids").map(String).filter(Boolean);
}

async function insertVehicleAccessories(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  vehicleId: string,
  accessoryIds: string[]
): Promise<string | null> {
  if (accessoryIds.length === 0) return null;
  const { error } = await supabase
    .from("vehicle_accessories")
    .insert(accessoryIds.map((accessoryId) => ({ vehicle_id: vehicleId, accessory_id: accessoryId })));
  if (error) return `Falha ao vincular acessórios: ${error.message}`;
  return null;
}

/** Replaces a vehicle's accessory links with `accessoryIds`, including clearing them all when empty. */
async function syncVehicleAccessories(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  vehicleId: string,
  accessoryIds: string[]
): Promise<string | null> {
  const { error: deleteError } = await supabase
    .from("vehicle_accessories")
    .delete()
    .eq("vehicle_id", vehicleId);
  if (deleteError) return `Falha ao atualizar acessórios: ${deleteError.message}`;

  return insertVehicleAccessories(supabase, vehicleId, accessoryIds);
}

function validateVehicleFields(
  fields: ReturnType<typeof parseVehicleFields>
): string | null {
  if (!fields.brand_id) {
    return "Selecione a marca do veículo.";
  }
  if (!fields.model || !fields.fuel || !fields.color || !fields.body_type_id) {
    return "Preencha todos os campos obrigatórios.";
  }
  if (!Number.isFinite(fields.year) || fields.year < 1900) {
    return "Ano inválido.";
  }
  if (!Number.isFinite(fields.price) || fields.price < 0) {
    return "Preço inválido.";
  }
  if (!Number.isFinite(fields.km) || fields.km < 0) {
    return "Quilometragem inválida.";
  }
  if (fields.transmission !== "manual" && fields.transmission !== "automatic") {
    return "Câmbio inválido.";
  }
  return null;
}

/** Photo URLs the browser already uploaded to the "vehicle-photos" bucket. */
function parsePhotoUrls(formData: FormData, existingCount: number): { urls: string[]; error: string | null } {
  const urls = formData.getAll("photo_urls").map(String).filter(Boolean);
  if (urls.some((u) => !isBucketPublicUrl(u, "vehicle-photos"))) {
    return { urls: [], error: "Foto inválida." };
  }
  if (existingCount + urls.length > MAX_PHOTOS_PER_VEHICLE) {
    return { urls: [], error: `Máximo de ${MAX_PHOTOS_PER_VEHICLE} fotos por veículo.` };
  }
  return { urls, error: null };
}

export async function createVehicleAction(formData: FormData): Promise<ActionResult> {
  await requireUser();

  const fields = parseVehicleFields(formData);
  const fieldError = validateVehicleFields(fields);
  if (fieldError) return { error: fieldError };

  const photos = parsePhotoUrls(formData, 0);
  if (photos.error) return { error: photos.error };

  const images = orderImagesWithFeatured([], photos.urls, String(formData.get("featured") ?? "") || null);

  const supabase = await createServerSupabaseClient();
  const { data: inserted, error: insertError } = await supabase
    .from("vehicles")
    .insert({ ...fields, images })
    .select("id")
    .single();

  if (insertError) return { error: `Falha ao salvar veículo: ${insertError.message}` };

  const accessoryError = await insertVehicleAccessories(supabase, inserted.id, parseAccessoryIds(formData));
  if (accessoryError) return { error: accessoryError };

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function updateVehicleAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();

  const fields = parseVehicleFields(formData);
  const fieldError = validateVehicleFields(fields);
  if (fieldError) return { error: fieldError };

  const existingImages = formData.getAll("kept_images").map(String).filter(Boolean);
  const photos = parsePhotoUrls(formData, existingImages.length);
  if (photos.error) return { error: photos.error };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ ...fields, images: orderImagesWithFeatured(existingImages, photos.urls, String(formData.get("featured") ?? "") || null) })
    .eq("id", id);

  if (error) return { error: `Falha ao atualizar veículo: ${error.message}` };

  const accessoryError = await syncVehicleAccessories(supabase, id, parseAccessoryIds(formData));
  if (accessoryError) return { error: accessoryError };

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${id}`);
  redirect(`/estoque/${id}`);
}

export async function deleteVehicleAction(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) return { error: `Falha ao excluir veículo: ${error.message}` };

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function markVehicleAsSoldAction(id: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data: vehicle, error: fetchError } = await supabase
    .from("vehicles")
    .select("model, year, km, price, brand:brands(name)")
    .eq("id", id)
    .single();
  if (fetchError || !vehicle) return { error: "Veículo não encontrado." };

  const brand = Array.isArray(vehicle.brand) ? vehicle.brand[0] : vehicle.brand;
  const { error: insertError } = await supabase.from("sold_vehicles").insert({
    brand: brand?.name ?? "",
    model: vehicle.model,
    year: vehicle.year,
    km: vehicle.km,
    price: vehicle.price,
  });
  if (insertError) return { error: `Falha ao registrar venda: ${insertError.message}` };

  const { error: deleteError } = await supabase.from("vehicles").delete().eq("id", id);
  if (deleteError) return { error: `Falha ao remover veículo do estoque: ${deleteError.message}` };

  revalidatePath("/estoque");
  redirect("/estoque");
}

