import type { Brand } from "./brands";
import type { Accessory } from "./accessories";
import type { BodyType } from "./body-types";

export type Vehicle = {
  id: string;
  brand: Brand | null;
  bodyType: BodyType | null;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: "manual" | "automatic";
  fuel: string;
  color: string;
  images: string[];
  description: string;
  accessories: Accessory[];
};

export type VehicleFilters = {
  brandId?: string;
  bodyTypeId?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxKm?: number;
  transmission?: "manual" | "automatic";
  fuel?: string;
  color?: string;
  accessoryIds?: string[];
};

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  return vehicles.filter((v) => {
    if (filters.brandId && v.brand?.id !== filters.brandId) return false;
    if (filters.bodyTypeId && v.bodyType?.id !== filters.bodyTypeId) return false;
    if (filters.model && v.model !== filters.model) return false;
    if (filters.minYear && v.year < filters.minYear) return false;
    if (filters.maxYear && v.year > filters.maxYear) return false;
    if (filters.minPrice && v.price < filters.minPrice) return false;
    if (filters.maxPrice && v.price > filters.maxPrice) return false;
    if (filters.maxKm && v.km > filters.maxKm) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.fuel && v.fuel !== filters.fuel) return false;
    if (filters.color && v.color !== filters.color) return false;
    if (filters.accessoryIds && filters.accessoryIds.length > 0) {
      const vehicleAccessoryIds = new Set(v.accessories.map((a) => a.id));
      if (!filters.accessoryIds.every((id) => vehicleAccessoryIds.has(id))) return false;
    }
    return true;
  });
}
