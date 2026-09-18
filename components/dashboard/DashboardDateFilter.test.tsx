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
  it("renders the initial date", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialAte="2026-09-18" />);

    expect(screen.getByLabelText("Vendas até")).toHaveValue("2026-09-18");
  });

  it("navigates to the dashboard with the new date on change", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialAte="2026-09-18" />);

    fireEvent.change(screen.getByLabelText("Vendas até"), { target: { value: "2026-09-01" } });

    expect(pushMock).toHaveBeenCalledWith("/admin/dashboard?ate=2026-09-01");
  });

  it("does not navigate when the date is cleared", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialAte="2026-09-18" />);

    fireEvent.change(screen.getByLabelText("Vendas até"), { target: { value: "" } });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("sets min to the first day of the current month", async () => {
    const { default: DashboardDateFilter } = await import("./DashboardDateFilter");
    render(<DashboardDateFilter initialAte="2026-09-18" />);

    const expectedMin = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
    expect(screen.getByLabelText("Vendas até")).toHaveAttribute("min", expectedMin);
  });
});
