import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockReset();
});

describe("DashboardDateFilter", () => {
  it("renders the initial start and end dates", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialDe="2026-09-01" initialAte="2026-09-18" />);

    expect(screen.getByLabelText("Inicial")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("Final")).toHaveValue("2026-09-18");
  });

  it("navigates with both dates when the start date changes", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialDe="2026-09-01" initialAte="2026-09-18" />);

    fireEvent.change(screen.getByLabelText("Inicial"), { target: { value: "2026-09-05" } });

    expect(pushMock).toHaveBeenCalledWith("/admin/dashboard?de=2026-09-05&ate=2026-09-18");
  });

  it("navigates with both dates when the end date changes", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialDe="2026-09-01" initialAte="2026-09-18" />);

    fireEvent.change(screen.getByLabelText("Final"), { target: { value: "2026-09-20" } });

    expect(pushMock).toHaveBeenCalledWith("/admin/dashboard?de=2026-09-01&ate=2026-09-20");
  });

  it("does not navigate when either date is cleared", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialDe="2026-09-01" initialAte="2026-09-18" />);

    fireEvent.change(screen.getByLabelText("Inicial"), { target: { value: "" } });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("constrains the start date to not exceed the end date, and the end date to not precede the start date", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialDe="2026-09-01" initialAte="2026-09-18" />);

    expect(screen.getByLabelText("Inicial")).toHaveAttribute("max", "2026-09-18");
    expect(screen.getByLabelText("Final")).toHaveAttribute("min", "2026-09-01");
  });
});
