import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MetricCard from "./MetricCard";

describe("MetricCard", () => {
  it("renders the label, value and icon in the light variant by default", () => {
    render(
      <MetricCard label="Carros em Estoque" value="128" accent="slate" icon={<span data-testid="icon" />} />
    );

    expect(screen.getByText("Carros em Estoque")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders an optional caption in the dark variant", () => {
    render(
      <MetricCard
        label="Faturamento"
        value="R$ 128.450,00"
        accent="red"
        variant="dark"
        icon={<span data-testid="icon" />}
        caption="7 vendas no período"
      />
    );

    expect(screen.getByText("7 vendas no período")).toBeInTheDocument();
  });
});
