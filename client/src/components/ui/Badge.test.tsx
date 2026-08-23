import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("should render its text with default styles", () => {
    render(<Badge>Draft</Badge>);

    const badge = screen.getByText("Draft");
    expect(badge.className).toContain("bg-zinc-100");
  });

  it("should apply the chosen variant classes", () => {
    render(<Badge variant="success">Active</Badge>);

    expect(screen.getByText("Active").className).toContain("bg-green-100");
  });
});
