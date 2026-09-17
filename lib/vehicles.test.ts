import { describe, it, expect } from "vitest";
import { filterVehicles, pickSimilarVehicles, type Vehicle } from "./vehicles";

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

describe("pickSimilarVehicles", () => {
  const ford = { id: "b3", name: "Ford", logoUrl: null };
  const hatch = { id: "t3", name: "Hatch" };

  function makeVehicle(overrides: Partial<Vehicle> & { id: string }): Vehicle {
    return {
      brand: null, bodyType: null, model: "X", year: 2020, price: 50000,
      km: 10000, transmission: "automatic", fuel: "Flex", color: "Prata",
      images: [], description: "", accessories: [],
      ...overrides,
    };
  }

  const target = makeVehicle({ id: "target", brand: toyota, bodyType: sedan });

  it("prioritizes vehicles with the same brand", () => {
    const sameBrandA = makeVehicle({ id: "a", brand: toyota, bodyType: suv });
    const sameBrandB = makeVehicle({ id: "b", brand: toyota, bodyType: hatch });
    const sameBrandC = makeVehicle({ id: "c", brand: toyota, bodyType: sedan });
    const other = makeVehicle({ id: "d", brand: honda, bodyType: sedan });

    const result = pickSimilarVehicles([target, sameBrandA, sameBrandB, sameBrandC, other], target, 3);

    expect(result.map((v) => v.id)).toEqual(["a", "b", "c"]);
  });

  it("falls back to the same body type when there aren't enough same-brand matches", () => {
    const sameBrand = makeVehicle({ id: "a", brand: toyota, bodyType: suv });
    const sameBodyType1 = makeVehicle({ id: "b", brand: honda, bodyType: sedan });
    const sameBodyType2 = makeVehicle({ id: "c", brand: ford, bodyType: sedan });
    const unrelated = makeVehicle({ id: "d", brand: ford, bodyType: hatch });

    const result = pickSimilarVehicles([target, sameBrand, sameBodyType1, sameBodyType2, unrelated], target, 3);

    expect(result.map((v) => v.id)).toEqual(["a", "b", "c"]);
  });

  it("falls back to any other vehicle when still not enough matches", () => {
    const sameBrand = makeVehicle({ id: "a", brand: toyota, bodyType: hatch });
    const unrelated1 = makeVehicle({ id: "b", brand: honda, bodyType: hatch });
    const unrelated2 = makeVehicle({ id: "c", brand: ford, bodyType: hatch });

    const result = pickSimilarVehicles([target, sameBrand, unrelated1, unrelated2], target, 3);

    expect(result.map((v) => v.id)).toEqual(["a", "b", "c"]);
  });

  it("excludes the target vehicle itself", () => {
    const other = makeVehicle({ id: "a", brand: toyota, bodyType: sedan });

    const result = pickSimilarVehicles([target, other], target, 3);

    expect(result.map((v) => v.id)).toEqual(["a"]);
  });

  it("respects the limit", () => {
    const a = makeVehicle({ id: "a", brand: toyota, bodyType: sedan });
    const b = makeVehicle({ id: "b", brand: toyota, bodyType: sedan });
    const c = makeVehicle({ id: "c", brand: toyota, bodyType: sedan });

    const result = pickSimilarVehicles([target, a, b, c], target, 2);

    expect(result).toHaveLength(2);
  });
});
