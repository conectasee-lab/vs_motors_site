import { describe, it, expect } from "vitest";
import { filterVehicles, type Vehicle } from "./vehicles";

const sample: Vehicle[] = [
  {
    id: "1", brand: "Toyota", model: "Corolla", year: 2020, price: 90000,
    km: 40000, transmission: "automatic", fuel: "Flex", color: "Prata",
    images: [], description: "",
  },
  {
    id: "2", brand: "Honda", model: "Civic", year: 2018, price: 75000,
    km: 60000, transmission: "manual", fuel: "Flex", color: "Preto",
    images: [], description: "",
  },
  {
    id: "3", brand: "Toyota", model: "Hilux", year: 2022, price: 220000,
    km: 15000, transmission: "automatic", fuel: "Diesel", color: "Branco",
    images: [], description: "",
  },
];

describe("filterVehicles", () => {
  it("returns all vehicles when no filters are given", () => {
    expect(filterVehicles(sample, {})).toHaveLength(3);
  });

  it("filters by brand", () => {
    const result = filterVehicles(sample, { brand: "Toyota" });
    expect(result.map((v) => v.id)).toEqual(["1", "3"]);
  });

  it("filters by price range", () => {
    const result = filterVehicles(sample, { minPrice: 80000, maxPrice: 100000 });
    expect(result.map((v) => v.id)).toEqual(["1"]);
  });

  it("filters by max km", () => {
    const result = filterVehicles(sample, { maxKm: 50000 });
    expect(result.map((v) => v.id)).toEqual(["1", "3"]);
  });

  it("filters by transmission", () => {
    const result = filterVehicles(sample, { transmission: "manual" });
    expect(result.map((v) => v.id)).toEqual(["2"]);
  });

  it("combines multiple filters", () => {
    const result = filterVehicles(sample, { brand: "Toyota", transmission: "automatic", minYear: 2021 });
    expect(result.map((v) => v.id)).toEqual(["3"]);
  });
});
