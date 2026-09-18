import { describe, it, expect } from "vitest";
import { sumRevenue, groupByBrand, countByBrand } from "./dashboard-aggregations";

describe("sumRevenue", () => {
  it("sums the price field across rows", () => {
    expect(sumRevenue([{ price: 1000 }, { price: 2500.5 }])).toBe(3500.5);
  });

  it("returns 0 for an empty list", () => {
    expect(sumRevenue([])).toBe(0);
  });
});

describe("groupByBrand", () => {
  it("groups vehicles by brand name, sorted alphabetically", () => {
    const rows = [
      { id: "1", model: "Corolla", year: 2020, brandName: "Toyota" },
      { id: "2", model: "Onix", year: 2021, brandName: "Chevrolet" },
      { id: "3", model: "Hilux", year: 2022, brandName: "Toyota" },
    ];

    expect(groupByBrand(rows)).toEqual([
      { marca: "Chevrolet", veiculos: [{ id: "2", model: "Onix", year: 2021 }] },
      {
        marca: "Toyota",
        veiculos: [
          { id: "1", model: "Corolla", year: 2020 },
          { id: "3", model: "Hilux", year: 2022 },
        ],
      },
    ]);
  });

  it("returns an empty list for no vehicles", () => {
    expect(groupByBrand([])).toEqual([]);
  });
});

describe("countByBrand", () => {
  it("counts vehicles per brand, sorted by count descending", () => {
    const rows = [
      { id: "1", model: "Corolla", year: 2020, brandName: "Toyota" },
      { id: "2", model: "Onix", year: 2021, brandName: "Chevrolet" },
      { id: "3", model: "Hilux", year: 2022, brandName: "Toyota" },
    ];

    expect(countByBrand(rows)).toEqual([
      { marca: "Toyota", quantidade: 2 },
      { marca: "Chevrolet", quantidade: 1 },
    ]);
  });

  it("breaks ties alphabetically", () => {
    const rows = [
      { id: "1", model: "Onix", year: 2021, brandName: "Chevrolet" },
      { id: "2", model: "Corolla", year: 2020, brandName: "Toyota" },
    ];

    expect(countByBrand(rows)).toEqual([
      { marca: "Chevrolet", quantidade: 1 },
      { marca: "Toyota", quantidade: 1 },
    ]);
  });
});
