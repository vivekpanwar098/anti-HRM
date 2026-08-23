import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LucideIcon } from "lucide-react";
import SidebarItem, { type SidebarItemData } from "./SidebarItem";
import { usePathname } from "next/navigation";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);

const StubIcon = ((props: { className?: string }) => (
  <svg data-testid="icon" className={props.className} />
)) as unknown as LucideIcon;

const item: SidebarItemData = {
  label: "Dashboard",
  Icon: StubIcon,
  url: "/dashboard",
};

describe("SidebarItem", () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue("/dashboard");
  });

  it("should render its label and icon", () => {
    render(<SidebarItem item={item} />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should link to the item url", () => {
    render(<SidebarItem item={item} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/dashboard");
  });

  it("should be highlighted as active when pathname matches the item url", () => {
    mockedUsePathname.mockReturnValue("/dashboard");

    render(<SidebarItem item={item} />);

    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-sidebar-active-bg");
  });

  it("should not be highlighted when pathname differs from the item url", () => {
    mockedUsePathname.mockReturnValue("/employees");

    render(<SidebarItem item={item} />);

    const link = screen.getByRole("link");
    expect(link.className).not.toContain("bg-sidebar-active-bg");
    expect(link.className).toContain("hover:bg-sidebar-hover-bg");
  });
});
