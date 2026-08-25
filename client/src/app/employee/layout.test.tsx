import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeeLayout from "./layout";
import type { ReactNode } from "react";

vi.mock("@/components/EmployeeAuthWrapper", () => ({
  default: ({ children }: { children?: ReactNode }) => (
    <div data-testid="auth-wrapper">{children}</div>
  ),
}));

vi.mock("@/features/sidebar/components/Sidebar", () => ({
  default: (props: {
    isOpen?: boolean;
    items?: unknown[];
    closeSidebar?: () => void;
  }) => (
    <div
      data-testid="sidebar"
      data-isopen={props.isOpen ? "true" : "false"}
      data-items-length={props.items?.length ?? 0}
    />
  ),
}));

vi.mock("@/features/header/components/Header", () => ({
  default: (props: { openSidebar?: () => void }) => (
    <button data-testid="open-sidebar" onClick={props.openSidebar}>
      Open
    </button>
  ),
}));

describe("EmployeeLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders auth wrapper, sidebar, header and children, and toggles sidebar", async () => {
    render(
      <EmployeeLayout>
        <div>Employee Content</div>
      </EmployeeLayout>,
    );

    expect(screen.getByTestId("auth-wrapper")).toBeInTheDocument();
    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-isopen", "false");
    // navItems length in layout is 6
    expect(sidebar).toHaveAttribute("data-items-length", "6");

    expect(screen.getByText("Employee Content")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("open-sidebar"));

    await waitFor(() =>
      expect(screen.getByTestId("sidebar")).toHaveAttribute(
        "data-isopen",
        "true",
      ),
    );
  });
});
