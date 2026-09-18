import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import EstoquePorMarcaPizza from "./EstoquePorMarcaPizza";

beforeAll(() => {
  // Recharts' ResponsiveContainer needs a non-zero measured size to render
  // its children; jsdom reports 0 for offsetWidth/offsetHeight by default
  // and has no ResizeObserver, so we stub both.
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 500,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 220,
  });

  class MockResizeObserver {
    private callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: { width: 500, height: 220 } as DOMRectReadOnly,
          } as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver
      );
    }
    unobserve() {}
    disconnect() {}
  }

  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

describe("EstoquePorMarcaPizza", () => {
  it("shows an empty-state message when there is no data", () => {
    render(<EstoquePorMarcaPizza dados={[]} />);
    expect(screen.getByText("Nenhum veículo em estoque.")).toBeInTheDocument();
  });

  it("shows a legend row per brand with its vehicle count", () => {
    render(
      <EstoquePorMarcaPizza
        dados={[
          { marca: "Toyota", quantidade: 2 },
          { marca: "Chevrolet", quantidade: 1 },
        ]}
      />
    );

    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Chevrolet")).toBeInTheDocument();
    expect(screen.getAllByText("2")).not.toHaveLength(0);
    expect(screen.getAllByText("1")).not.toHaveLength(0);
  });

  it("does not scroll the legend when there are 6 or fewer brands", () => {
    const dados = Array.from({ length: 6 }, (_, i) => ({ marca: `Marca ${i}`, quantidade: 1 }));
    render(<EstoquePorMarcaPizza dados={dados} />);

    expect(screen.getByText("Marca 0").closest("ul")).not.toHaveClass("overflow-y-auto");
  });

  it("scrolls the legend when there are more than 6 brands", () => {
    const dados = Array.from({ length: 7 }, (_, i) => ({ marca: `Marca ${i}`, quantidade: 1 }));
    render(<EstoquePorMarcaPizza dados={dados} />);

    expect(screen.getByText("Marca 0").closest("ul")).toHaveClass("overflow-y-auto");
  });
});
