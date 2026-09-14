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

export const vehicles: Vehicle[] = [
  {
    id: "1", brand: "Toyota", model: "Corolla", year: 2021, price: 112000,
    km: 32000, transmission: "automatic", fuel: "Flex", color: "Prata",
    images: ["/vehicles/placeholder-1.jpg"],
    description: "Toyota Corolla completo, único dono, revisado.",
  },
  {
    id: "2", brand: "Honda", model: "Civic", year: 2019, price: 98000,
    km: 55000, transmission: "automatic", fuel: "Flex", color: "Preto",
    images: ["/vehicles/placeholder-2.jpg"],
    description: "Honda Civic EXL, teto solar, bancos em couro.",
  },
  {
    id: "3", brand: "Jeep", model: "Compass", year: 2022, price: 165000,
    km: 18000, transmission: "automatic", fuel: "Flex", color: "Branco",
    images: ["/vehicles/placeholder-3.jpg"],
    description: "Jeep Compass Longitude, seminovo, garantia de fábrica.",
  },
  {
    id: "4", brand: "Volkswagen", model: "Gol", year: 2017, price: 48000,
    km: 78000, transmission: "manual", fuel: "Flex", color: "Vermelho",
    images: ["/vehicles/placeholder-4.jpg"],
    description: "VW Gol 1.6, econômico, ideal para o dia a dia.",
  },
  {
    id: "5", brand: "Chevrolet", model: "Onix", year: 2020, price: 72000,
    km: 40000, transmission: "automatic", fuel: "Flex", color: "Cinza",
    images: ["/vehicles/placeholder-5.jpg"],
    description: "Chevrolet Onix LT, multimídia, baixo km.",
  },
  {
    id: "6", brand: "Toyota", model: "Hilux", year: 2023, price: 285000,
    km: 9000, transmission: "automatic", fuel: "Diesel", color: "Prata",
    images: ["/vehicles/placeholder-6.jpg"],
    description: "Toyota Hilux SRX 4x4, praticamente zero.",
  },
];
