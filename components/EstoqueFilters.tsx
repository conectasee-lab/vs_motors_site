"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { filterVehicles, type VehicleFilters, type Vehicle } from "@/lib/vehicles";
import type { Brand } from "@/lib/brands";
import type { BodyType } from "@/lib/body-types";
import type { Accessory } from "@/lib/accessories";
import VehicleCard from "@/components/VehicleCard";
import EmployeeBar from "@/components/EmployeeBar";

const PRICE_RANGES = [
  { label: "Até R$ 50 mil", min: undefined, max: 50000 },
  { label: "R$ 50–100 mil", min: 50000, max: 100000 },
  { label: "R$ 100–200 mil", min: 100000, max: 200000 },
  { label: "Acima de R$ 200 mil", min: 200000, max: undefined },
] as const;

const SORT_OPTIONS = [
  { label: "Relevância", value: "relevance" },
  { label: "Marca/Modelo", value: "brand-model" },
  { label: "Menor Preço", value: "price-asc" },
  { label: "Maior Preço", value: "price-desc" },
  { label: "Ano Mais Novo", value: "year-desc" },
  { label: "Menor KM", value: "km-asc" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

function sortVehicles(vehicles: Vehicle[], sort: SortOption): Vehicle[] {
  if (sort === "relevance") return vehicles;
  const sorted = [...vehicles];
  switch (sort) {
    case "brand-model":
      sorted.sort((a, b) => `${a.brand?.name ?? ""} ${a.model}`.localeCompare(`${b.brand?.name ?? ""} ${b.model}`, "pt-BR"));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "year-desc":
      sorted.sort((a, b) => b.year - a.year);
      break;
    case "km-asc":
      sorted.sort((a, b) => a.km - b.km);
      break;
  }
  return sorted;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="break-inside-avoid">
      <legend className="font-bold text-brand-black text-sm mb-3">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

const LIMITED_LIST_MAX = 6;

function LimitedList<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = items.length > LIMITED_LIST_MAX;
  const visibleItems = expanded || !canCollapse ? items : items.slice(0, LIMITED_LIST_MAX);

  return (
    <>
      {visibleItems.map(renderItem)}
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-brand-red font-semibold hover:underline"
        >
          {expanded ? "Ver menos" : `Ver mais (${items.length - LIMITED_LIST_MAX})`}
        </button>
      )}
    </>
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

function CheckboxOption({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-gray-700 cursor-pointer group">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
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
  brands,
  bodyTypes,
  accessories,
  isLoggedIn = false,
}: {
  vehicles: Vehicle[];
  brands: Brand[];
  bodyTypes: BodyType[];
  accessories: Accessory[];
  isLoggedIn?: boolean;
}) {
  const brandOptions = brands;
  const models = Array.from(new Set(vehicles.map((v) => v.model))).sort();
  const fuels = Array.from(new Set(vehicles.map((v) => v.fuel))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const colors = Array.from(new Set(vehicles.map((v) => v.color))).sort();

  const [filters, setFilters] = useState<VehicleFilters>({});
  const [priceRangeLabel, setPriceRangeLabel] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function update<K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function countBy<K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K], active: VehicleFilters) {
    return filterVehicles(vehicles, { ...active, [key]: value }).length;
  }

  const selectedAccessoryIds = filters.accessoryIds ?? [];

  function toggleAccessory(id: string) {
    setFilters((f) => {
      const current = f.accessoryIds ?? [];
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...f, accessoryIds: next.length > 0 ? next : undefined };
    });
  }

  function countByAccessory(id: string) {
    const withThisOne = selectedAccessoryIds.includes(id)
      ? selectedAccessoryIds
      : [...selectedAccessoryIds, id];
    return filterVehicles(vehicles, { ...filters, accessoryIds: withThisOne }).length;
  }

  function clearFilters() {
    setFilters({});
    setPriceRangeLabel(null);
    setSearch("");
  }

  const results = useMemo(() => {
    const base = filterVehicles(vehicles, filters);
    const searched = !search.trim()
      ? base
      : base.filter((v) => `${v.brand?.name ?? ""} ${v.model}`.toLowerCase().includes(search.trim().toLowerCase()));
    return sortVehicles(searched, sortOption);
  }, [vehicles, filters, search, sortOption]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? "Relevância";

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

  const filterPanel = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-6">
      <FilterGroup title="Carroceria">
        <RadioOption
          name="bodyType"
          checked={!filters.bodyTypeId}
          onChange={() => update("bodyTypeId", undefined)}
          label="Todas"
          count={countBy("bodyTypeId", undefined, { ...filters, bodyTypeId: undefined })}
        />
        <LimitedList
          items={bodyTypes}
          renderItem={(b) => (
            <RadioOption
              key={b.id}
              name="bodyType"
              checked={filters.bodyTypeId === b.id}
              onChange={() => update("bodyTypeId", b.id)}
              label={b.name}
              count={countBy("bodyTypeId", b.id, { ...filters, bodyTypeId: undefined })}
            />
          )}
        />
      </FilterGroup>

      <FilterGroup title="Modelo">
        <RadioOption
          name="model"
          checked={!filters.model}
          onChange={() => update("model", undefined)}
          label="Todos"
        />
        <LimitedList
          items={models}
          renderItem={(m) => (
            <RadioOption
              key={m}
              name="model"
              checked={filters.model === m}
              onChange={() => update("model", m)}
              label={m}
              count={countBy("model", m, { ...filters, model: undefined })}
            />
          )}
        />
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

      <FilterGroup title="Ano do veículo">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">De</label>
            <input
              type="number"
              placeholder="ex: 2018"
              value={filters.minYear ?? ""}
              onChange={(e) => update("minYear", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Até</label>
            <input
              type="number"
              placeholder="ex: 2024"
              value={filters.maxYear ?? ""}
              onChange={(e) => update("maxYear", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
        </div>
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
        <LimitedList
          items={fuels}
          renderItem={(f) => (
            <RadioOption
              key={f}
              name="fuel"
              checked={filters.fuel === f}
              onChange={() => update("fuel", f)}
              label={f}
              count={countBy("fuel", f, { ...filters, fuel: undefined })}
            />
          )}
        />
      </FilterGroup>

      <FilterGroup title="Cor">
        <RadioOption
          name="color"
          checked={!filters.color}
          onChange={() => update("color", undefined)}
          label="Todas"
        />
        <LimitedList
          items={colors}
          renderItem={(c) => (
            <RadioOption
              key={c}
              name="color"
              checked={filters.color === c}
              onChange={() => update("color", c)}
              label={c}
              count={countBy("color", c, { ...filters, color: undefined })}
            />
          )}
        />
      </FilterGroup>

      {accessories.length > 0 && (
        <FilterGroup title="Acessórios">
          <LimitedList
            items={accessories}
            renderItem={(a) => (
              <CheckboxOption
                key={a.id}
                checked={selectedAccessoryIds.includes(a.id)}
                onChange={() => toggleAccessory(a.id)}
                label={a.name}
                count={countByAccessory(a.id)}
              />
            )}
          />
        </FilterGroup>
      )}
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
          <div>
            <button
              onClick={() => {
                setFiltersOpen((o) => !o);
                setSortOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-brand-black hover:border-gray-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filtrar{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>

          <div ref={sortRef} className="relative">
            <button
              onClick={() => {
                setSortOpen((o) => !o);
                setFiltersOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-brand-black hover:border-gray-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Ordenar por
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-2 w-52">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOption === option.value ? "text-brand-red font-semibold" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} {results.length === 1 ? "veículo encontrado" : "veículos encontrados"}
            {sortOption !== "relevance" ? ` · Ordenado por ${sortLabel}` : ""}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-brand-black">Filtros</h2>
              <div className="flex items-center gap-4">
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-brand-red font-semibold hover:underline">
                    Limpar
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Fechar filtros"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-brand-black"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">{filterPanel}</div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                {results.length} {results.length === 1 ? "veículo encontrado" : "veículos encontrados"}
              </span>
              <button
                onClick={() => setFiltersOpen(false)}
                className="px-6 py-2.5 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
