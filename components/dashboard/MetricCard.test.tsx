import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MetricCard from "./MetricCard";

describe("MetricCard", () => {
  it("renders the label and the big value in the quiet variant by default", () => {
    render(<MetricCard label="Carros em Estoque" value="128" accent="steel" />);

    expect(screen.getByText("Carros em Estoque")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
  });

  it("renders an optional caption", () => {
    render(<MetricCard label="Faturamento" value="R$ 128.450,00" accent="red" variant="hero" caption="7 vendas no período" />);

    expect(screen.getByText("7 vendas no período")).toBeInTheDocument();
  });
});
