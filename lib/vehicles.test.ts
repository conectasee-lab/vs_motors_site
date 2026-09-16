import { describe, it, expect } from "vitest";
import { filterVehicles, type Vehicle } from "./vehicles";

const toyota = { id: "b1", name: "Toyota", logoUrl: null };
const honda = { id: "b2", name: "Honda", logoUrl: null };

const sedan = { id: "t1", name: "Sedã" };
const suv = { id: "t2", name: "SUV" };

const arCondicionado = { id: "a1", name: "Ar condicionado" };
const cameraRe = { id: "a2", name: "Câmera de ré" };
const tetoSolar = { id: "a3", name: "Teto solar" };

const sample: Vehicle[] = [
  {
    id: "1", brand: toyota, bodyType: sedan, model: "Corolla", year: 2020, price: 90000,
    km: 40000, transmission: "automatic", fuel: "Flex", color: "Prata",
    images: [], description: "", accessories: [arCondicionado, cameraRe],
  },
  {
    id: "2", brand: honda, bodyType: sedan, model: "Civic", year: 2018, price: 75000,
    km: 60000, transmission: "manual", fuel: "Flex", color: "Preto",
    images: [], description: "", accessories: [arCondicionado],
  },
  {
    id: "3", brand: toyota, bodyType: suv, model: "Hilux", year: 2022, price: 220000,
    km: 15000, transmission: "automatic", fuel: "Diesel", color: "Branco",
    images: [], description: "", accessories: [],
  },
  {
    id: "4", brand: null, bodyType: null, model: "Modelo sem marca", year: 2015, price: 30000,
    km: 100000, transmission: "manual", fuel: "Flex", color: "Cinza",
    images: [], description: "", accessories: [arCondicionado, cameraRe, tetoSolar],
  },
];

describe("filterVehicles", () => {
  it("returns all vehicles when no filters are given", () => {
    expect(filterVehicles(sample, {})).toHaveLength(4);
  });

  it("filters by brandId", () => {
    const result = filterVehicles(sample, { brandId: "b1" });
    expect(result.map((v) => v.id)).toEqual(["1", "3"]);
  });

  it("excludes vehicles without a brand when filtering by brandId", () => {
    const result = filterVehicles(sample, { brandId: "b2" });
    expect(result.map((v) => v.id)).toEqual(["2"]);
  });

  it("filters by bodyTypeId", () => {
    const result = filterVehicles(sample, { bodyTypeId: "t2" });
    expect(result.map((v) => v.id)).toEqual(["3"]);
  });

  it("excludes vehicles without a body type when filtering by bodyTypeId", () => {
    const result = filterVehicles(sample, { bodyTypeId: "t1" });
    expect(result.map((v) => v.id)).toEqual(["1", "2"]);
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
    expect(result.map((v) => v.id)).toEqual(["2", "4"]);
  });

  it("combines multiple filters", () => {
    const result = filterVehicles(sample, { brandId: "b1", transmission: "automatic", minYear: 2021 });
    expect(result.map((v) => v.id)).toEqual(["3"]);
  });

  it("filters by a single accessory", () => {
    const result = filterVehicles(sample, { accessoryIds: ["a2"] });
    expect(result.map((v) => v.id)).toEqual(["1", "4"]);
  });

  it("requires a vehicle to have all selected accessories (AND, not OR)", () => {
    const result = filterVehicles(sample, { accessoryIds: ["a1", "a2"] });
    expect(result.map((v) => v.id)).toEqual(["1", "4"]);
  });

  it("excludes vehicles missing any of the selected accessories", () => {
    const result = filterVehicles(sample, { accessoryIds: ["a2", "a3"] });
    expect(result.map((v) => v.id)).toEqual(["4"]);
  });

  it("ignores the accessory filter when the list is empty", () => {
    expect(filterVehicles(sample, { accessoryIds: [] })).toHaveLength(4);
  });
});
