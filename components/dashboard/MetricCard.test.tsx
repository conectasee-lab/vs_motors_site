import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MetricCard from "./MetricCard";

describe("MetricCard", () => {
  it("renders the label and the big value", () => {
    render(<MetricCard label="Carros em Estoque" value="128" accentColor="red" icon={<span data-testid="icon" />} />);

    expect(screen.getByText("Carros em Estoque")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
