import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EstoquePorMarcaLista from "./EstoquePorMarcaLista";

describe("EstoquePorMarcaLista", () => {
  it("renders each brand with its vehicles", () => {
    render(
      <EstoquePorMarcaLista
        grupos={[
          { marca: "Toyota", veiculos: [{ id: "1", model: "Corolla", year: 2020 }] },
          { marca: "Chevrolet", veiculos: [{ id: "2", model: "Onix", year: 2021 }] },
        ]}
      />
    );

    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Corolla (2020)")).toBeInTheDocument();
    expect(screen.getByText("Chevrolet")).toBeInTheDocument();
    expect(screen.getByText("Onix (2021)")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no groups", () => {
    render(<EstoquePorMarcaLista grupos={[]} />);
    expect(screen.getByText("Nenhum veículo em estoque.")).toBeInTheDocument();
  });
});
