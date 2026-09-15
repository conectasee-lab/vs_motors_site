export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: "manual" | "automatic";
  fuel: string;
  color: string;
  images: string[];
  description: string;
};

export type VehicleFilters = {
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxKm?: number;
  transmission?: "manual" | "automatic";
  fuel?: string;
  color?: string;
};

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  return vehicles.filter((v) => {
    if (filters.brand && v.brand !== filters.brand) return false;
    if (filters.model && v.model !== filters.model) return false;
    if (filters.minYear && v.year < filters.minYear) return false;
    if (filters.maxYear && v.year > filters.maxYear) return false;
    if (filters.minPrice && v.price < filters.minPrice) return false;
    if (filters.maxPrice && v.price > filters.maxPrice) return false;
    if (filters.maxKm && v.km > filters.maxKm) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.fuel && v.fuel !== filters.fuel) return false;
    if (filters.color && v.color !== filters.color) return false;
    return true;
  });
}
