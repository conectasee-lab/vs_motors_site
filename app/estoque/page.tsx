"use client";

import { useMemo, useState } from "react";
import { vehicles, filterVehicles, type VehicleFilters } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";

const brands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
const fuels = Array.from(new Set(vehicles.map((v) => v.fuel))).sort();
const colors = Array.from(new Set(vehicles.map((v) => v.color))).sort();

export default function EstoquePage() {
  const [filters, setFilters] = useState<VehicleFilters>({});

  const results = useMemo(() => filterVehicles(vehicles, filters), [filters]);

  function update<K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value || undefined }));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Estoque</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-brand-black-soft p-4 rounded-lg border border-brand-gold/20">
        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("brand", e.target.value)}
        >
          <option value="">Marca</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("transmission", e.target.value as "manual" | "automatic")}
        >
          <option value="">Câmbio</option>
          <option value="manual">Manual</option>
          <option value="automatic">Automático</option>
        </select>

        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("fuel", e.target.value)}
        >
          <option value="">Combustível</option>
          {fuels.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("color", e.target.value)}
        >
          <option value="">Cor</option>
          {colors.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Ano mínimo"
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("minYear", e.target.value ? Number(e.target.value) : undefined)}
        />
        <input
          type="number"
          placeholder="Preço máximo"
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
        />
        <input
          type="number"
          placeholder="KM máxima"
          className="bg-black text-white border border-gray-700 rounded px-2 py-2"
          onChange={(e) => update("maxKm", e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      {results.length === 0 ? (
        <p className="text-gray-400">Nenhum veículo encontrado com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
}
