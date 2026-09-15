"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/vehicles";
import { MAX_PHOTOS_PER_VEHICLE } from "@/lib/vehicle-photos";

type Props = {
  action: (formData: FormData) => void;
  vehicle?: Vehicle;
  existingPhotoCount?: number;
  pending: boolean;
  error: string | null;
};

export default function VehicleForm({ action, vehicle, existingPhotoCount = 0, pending, error }: Props) {
  const [photoCount, setPhotoCount] = useState(0);
  const remaining = MAX_PHOTOS_PER_VEHICLE - existingPhotoCount - photoCount;

  return (
    <form action={action} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Marca</label>
          <input name="brand" defaultValue={vehicle?.brand} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo</label>
          <input name="model" defaultValue={vehicle?.model} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
          <input name="year" type="number" defaultValue={vehicle?.year} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Preço</label>
          <input name="price" type="number" step="0.01" defaultValue={vehicle?.price} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">KM</label>
          <input name="km" type="number" defaultValue={vehicle?.km} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Câmbio</label>
          <select name="transmission" defaultValue={vehicle?.transmission ?? "automatic"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="automatic">Automático</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Combustível</label>
          <input name="fuel" defaultValue={vehicle?.fuel} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cor</label>
          <input name="color" defaultValue={vehicle?.color} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
        <textarea name="description" defaultValue={vehicle?.description} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Fotos ({existingPhotoCount} já cadastradas — restam {remaining < 0 ? 0 : remaining})
        </label>
        <input
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
          className="w-full text-sm"
        />
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
