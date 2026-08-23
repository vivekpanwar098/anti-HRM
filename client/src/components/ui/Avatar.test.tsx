import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("should render an image when src is provided", () => {
    render(<Avatar name="Vishal Rawat" src="/vishal.png" />);

    expect(screen.getByAltText("Vishal Rawat")).toBeInTheDocument();
  });

  it("should show initials when no src is provided", () => {
    render(<Avatar name="Vishal Rawat" />);

    expect(screen.getByTitle("Vishal Rawat").textContent).toBe("VR");
  });

  it("should use a single initial for single-word names", () => {
    render(<Avatar name="Anshul" />);

    expect(screen.getByTitle("Anshul").textContent).toBe("A");
  });
});
