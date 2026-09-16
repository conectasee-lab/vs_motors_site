"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { filterVehicles, type VehicleFilters, type Vehicle } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";
import EmployeeBar from "@/components/EmployeeBar";

const PRICE_RANGES = [
  { label: "Até R$ 50 mil", min: undefined, max: 50000 },
  { label: "R$ 50–100 mil", min: 50000, max: 100000 },
  { label: "R$ 100–200 mil", min: 100000, max: 200000 },
  { label: "Acima de R$ 200 mil", min: 200000, max: undefined },
] as const;

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="py-5 border-b border-gray-200 first:pt-0 last:border-b-0">
      <legend className="font-bold text-brand-black text-sm mb-3">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function RadioOption({
  name,
  checked,
  onChange,
  label,
  count,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-gray-700 cursor-pointer group">
      <span className="flex items-center gap-2.5">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onChange}
          className="accent-brand-red w-4 h-4"
        />
        <span className={checked ? "text-brand-black font-semibold" : "group-hover:text-brand-black"}>
          {label}
        </span>
      </span>
      {count !== undefined && <span className="text-gray-400 text-xs">({count})</span>}
    </label>
  );
}

function BrandCarousel({
  brands,
  activeBrandId,
  onSelect,
}: {
  brands: { id: string; name: string; logoUrl: string | null }[];
  activeBrandId: string | undefined;
  onSelect: (brandId: string | undefined) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative mb-6">
      <button
        onClick={() => scrollBy(-240)}
        aria-label="Marcas anteriores"
        className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-brand-black hover:border-brand-red hover:text-brand-red transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          onClick={() => onSelect(undefined)}
          className={`shrink-0 w-24 flex flex-col items-center gap-2 px-3 py-3 rounded-lg border transition-colors ${
            !activeBrandId ? "border-brand-red bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${!activeBrandId ? "bg-brand-red text-white" : "bg-gray-100 text-gray-500"}`}>
            todas
          </span>
          <span className={`text-xs font-medium truncate w-full text-center ${!activeBrandId ? "text-brand-black" : "text-gray-600"}`}>Todas</span>
        </button>

        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={`shrink-0 w-24 flex flex-col items-center gap-2 px-3 py-3 rounded-lg border transition-colors ${
              activeBrandId === b.id ? "border-brand-red bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {b.logoUrl ? (
              <span className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                <Image src={b.logoUrl} alt={b.name} width={24} height={24} className="object-contain" />
              </span>
            ) : (
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${activeBrandId === b.id ? "bg-brand-red text-white" : "bg-gray-100 text-gray-500"}`}>
                {b.name.charAt(0)}
              </span>
            )}
            <span className={`text-xs font-medium truncate w-full text-center ${activeBrandId === b.id ? "text-brand-black" : "text-gray-600"}`}>{b.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => scrollBy(240)}
        aria-label="Próximas marcas"
        className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-brand-black hover:border-brand-red hover:text-brand-red transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}

export default function EstoqueFilters({
  vehicles,
  isLoggedIn = false,
}: {
  vehicles: Vehicle[];
  isLoggedIn?: boolean;
}) {
  const brandOptions = Array.from(
    new Map(
      vehicles
        .filter((v) => v.brand)
        .map((v) => [v.brand!.id, v.brand!])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));
  const models = Array.from(new Set(vehicles.map((v) => v.model))).sort();
  const fuels = Array.from(new Set(vehicles.map((v) => v.fuel))).sort();
  const colors = Array.from(new Set(vehicles.map((v) => v.color))).sort();

  const [filters, setFilters] = useState<VehicleFilters>({});
  const [priceRangeLabel, setPriceRangeLabel] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  function update<K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function countBy<K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K], active: VehicleFilters) {
    return filterVehicles(vehicles, { ...active, [key]: value }).length;
  }

  function clearFilters() {
    setFilters({});
    setPriceRangeLabel(null);
    setSearch("");
  }

  const results = useMemo(() => {
    const base = filterVehicles(vehicles, filters);
    if (!search.trim()) return base;
    const q = search.trim().toLowerCase();
    return base.filter((v) => `${v.brand?.name ?? ""} ${v.model}`.toLowerCase().includes(q));
  }, [vehicles, filters, search]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

  const filterPanel = (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-brand-black">Filtros</h2>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-brand-red font-semibold hover:underline">
            Limpar
          </button>
        )}
      </div>

      <FilterGroup title="Marca">
        <RadioOption
          name="brand"
          checked={!filters.brandId}
          onChange={() => update("brandId", undefined)}
          label="Todas"
          count={countBy("brandId", undefined, { ...filters, brandId: undefined })}
        />
        {brandOptions.map((b) => (
          <RadioOption
            key={b.id}
            name="brand"
            checked={filters.brandId === b.id}
            onChange={() => update("brandId", b.id)}
            label={b.name}
            count={countBy("brandId", b.id, { ...filters, brandId: undefined })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Modelo">
        <RadioOption
          name="model"
          checked={!filters.model}
          onChange={() => update("model", undefined)}
          label="Todos"
        />
        {models.map((m) => (
          <RadioOption
            key={m}
            name="model"
            checked={filters.model === m}
            onChange={() => update("model", m)}
            label={m}
            count={countBy("model", m, { ...filters, model: undefined })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Preço">
        {PRICE_RANGES.map((range) => (
          <RadioOption
            key={range.label}
            name="price"
            checked={priceRangeLabel === range.label}
            onChange={() => {
              setPriceRangeLabel(range.label);
              setFilters((f) => ({ ...f, minPrice: range.min, maxPrice: range.max }));
            }}
            label={range.label}
          />
        ))}
        {priceRangeLabel && (
          <button
            onClick={() => {
              setPriceRangeLabel(null);
              setFilters((f) => ({ ...f, minPrice: undefined, maxPrice: undefined }));
            }}
            className="text-xs text-brand-red font-semibold hover:underline"
          >
            Limpar preço
          </button>
        )}
      </FilterGroup>

      <FilterGroup title="Ano mínimo">
        <input
          type="number"
          placeholder="ex: 2018"
          value={filters.minYear ?? ""}
          onChange={(e) => update("minYear", e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
        />
      </FilterGroup>

      <FilterGroup title="Câmbio">
        <RadioOption
          name="transmission"
          checked={!filters.transmission}
          onChange={() => update("transmission", undefined)}
          label="Todos"
        />
        <RadioOption
          name="transmission"
          checked={filters.transmission === "automatic"}
          onChange={() => update("transmission", "automatic")}
          label="Automático"
          count={countBy("transmission", "automatic", { ...filters, transmission: undefined })}
        />
        <RadioOption
          name="transmission"
          checked={filters.transmission === "manual"}
          onChange={() => update("transmission", "manual")}
          label="Manual"
          count={countBy("transmission", "manual", { ...filters, transmission: undefined })}
        />
      </FilterGroup>

      <FilterGroup title="Combustível">
        <RadioOption
          name="fuel"
          checked={!filters.fuel}
          onChange={() => update("fuel", undefined)}
          label="Todos"
        />
        {fuels.map((f) => (
          <RadioOption
            key={f}
            name="fuel"
            checked={filters.fuel === f}
            onChange={() => update("fuel", f)}
            label={f}
            count={countBy("fuel", f, { ...filters, fuel: undefined })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Cor">
        <RadioOption
          name="color"
          checked={!filters.color}
          onChange={() => update("color", undefined)}
          label="Todas"
        />
        {colors.map((c) => (
          <RadioOption
            key={c}
            name="color"
            checked={filters.color === c}
            onChange={() => update("color", c)}
            label={c}
            count={countBy("color", c, { ...filters, color: undefined })}
          />
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-6">Estoque</h1>

        {isLoggedIn && <EmployeeBar />}

        <BrandCarousel brands={brandOptions} activeBrandId={filters.brandId} onSelect={(id) => update("brandId", id)} />

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar marca ou modelo..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen((o) => !o)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-brand-black"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filtrar{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>{filterPanel}</aside>

          <div>
            <p className="text-sm text-gray-500 mb-4">
              {results.length} {results.length === 1 ? "veículo encontrado" : "veículos encontrados"}
            </p>
            {results.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
                <p className="text-gray-600 font-medium mb-1">Nenhum veículo encontrado</p>
                <p className="text-gray-400 text-sm mb-4">Tente ajustar ou limpar os filtros.</p>
                <button onClick={clearFilters} className="text-brand-red font-semibold text-sm hover:underline">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} isLoggedIn={isLoggedIn} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
