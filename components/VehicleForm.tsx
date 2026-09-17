"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Vehicle } from "@/lib/vehicles";
import type { Brand } from "@/lib/brands";
import type { Accessory } from "@/lib/accessories";
import type { BodyType } from "@/lib/body-types";
import { MAX_PHOTOS_PER_VEHICLE } from "@/lib/vehicle-photos";

const YEAR_OPTIONS = Array.from({ length: 2040 - 1960 + 1 }, (_, i) => 2040 - i);

const FUEL_OPTIONS = [
  "Gasolina",
  "Álcool",
  "Flex",
  "Diesel",
  "GNV",
  "Eletricidade",
  "Hidrogênio",
  "Combustão Interna (ICE)",
  "Híbrido Convencional (HEV)",
  "Híbrido Plug-in (PHEV)",
  "Elétrico a Bateria (BEV)",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

type Props = {
  action: (formData: FormData) => void;
  vehicle?: Vehicle;
  brands: Brand[];
  bodyTypes: BodyType[];
  accessories: Accessory[];
  pending: boolean;
  error: string | null;
};

export default function VehicleForm({ action, vehicle, brands, bodyTypes, accessories, pending, error }: Props) {
  const [keptImages, setKeptImages] = useState<string[]>(() => vehicle?.images ?? []);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_PHOTOS_PER_VEHICLE - keptImages.length - photoFiles.length;

  useEffect(() => {
    const urls = photoFiles.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photoFiles]);

  function updateFileInput(files: File[]) {
    const dataTransfer = new DataTransfer();
    files.forEach((f) => dataTransfer.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
    setPhotoFiles(files);
  }

  function removeNewPhoto(index: number) {
    updateFileInput(photoFiles.filter((_, i) => i !== index));
  }

  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>(
    () => vehicle?.accessories.map((a) => a.id) ?? []
  );
  const [accessoriesOpen, setAccessoriesOpen] = useState(selectedAccessoryIds.length > 0);

  function toggleAccessory(id: string) {
    setSelectedAccessoryIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  return (
    <form action={action} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Marca</label>
          <select name="brand_id" defaultValue={vehicle?.brand?.id ?? ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="">Selecione uma marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Carroceria</label>
          <select name="body_type_id" defaultValue={vehicle?.bodyType?.id ?? ""} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="" disabled>Selecione uma carroceria</option>
            {bodyTypes.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo</label>
          <input name="model" defaultValue={vehicle?.model} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
          <select name="year" defaultValue={vehicle?.year ?? ""} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="" disabled>Selecione o ano</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Preço</label>
          <input name="price" type="number" step="0.01" defaultValue={vehicle?.price} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">KM</label>
          <input name="km" type="number" defaultValue={vehicle?.km} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Câmbio</label>
          <select name="transmission" defaultValue={vehicle?.transmission ?? "automatic"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="automatic">Automático</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Combustível</label>
          <select name="fuel" defaultValue={vehicle?.fuel ?? ""} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
            <option value="" disabled>Selecione o combustível</option>
            {vehicle?.fuel && !FUEL_OPTIONS.includes(vehicle.fuel) && (
              <option value={vehicle.fuel}>{vehicle.fuel}</option>
            )}
            {FUEL_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cor</label>
          <input name="color" defaultValue={vehicle?.color} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
        <textarea name="description" defaultValue={vehicle?.description} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
      </div>

      {accessories.length > 0 && (
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setAccessoriesOpen((o) => !o)}
            aria-expanded={accessoriesOpen}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700"
          >
            <span>
              Acessórios
              {selectedAccessoryIds.length > 0 && (
                <span className="text-gray-400 font-normal"> ({selectedAccessoryIds.length} selecionado{selectedAccessoryIds.length > 1 ? "s" : ""})</span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${accessoriesOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div className={`grid grid-cols-2 gap-2 px-4 pb-4 ${accessoriesOpen ? "" : "hidden"}`}>
            {accessories.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="accessory_ids"
                  value={a.id}
                  checked={selectedAccessoryIds.includes(a.id)}
                  onChange={() => toggleAccessory(a.id)}
                  className="accent-brand-red w-4 h-4"
                />
                {a.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Fotos ({keptImages.length} já cadastradas — restam {remaining < 0 ? 0 : remaining})
        </label>

        {keptImages.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
            {keptImages.map((url) => (
              <div key={url} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <Image src={url} alt="Foto do veículo" fill className="object-cover" />
                <input type="hidden" name="kept_images" value={url} />
                <button
                  type="button"
                  onClick={() => setKeptImages((imgs) => imgs.filter((u) => u !== url))}
                  aria-label="Remover foto"
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/70 text-white text-xs leading-none hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => updateFileInput(Array.from(e.target.files ?? []))}
          className="w-full text-sm text-gray-700"
        />

        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
            {photoPreviews.map((url, i) => (
              <div key={url} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Prévia da nova foto" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  aria-label="Remover foto"
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/70 text-white text-xs leading-none hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending || remaining < 0}
        className="px-5 py-2.5 bg-brand-red text-white font-semibold rounded-lg disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
