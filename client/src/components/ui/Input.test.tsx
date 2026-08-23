import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Input from "./Input";

describe("Input", () => {
  it("should render a label linked to the input", () => {
    render(<Input label="Email" placeholder="you@company.com" />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("placeholder", "you@company.com");
  });

  it("should show an error message and mark the input as invalid", () => {
    render(<Input label="Email" error="Email is required" />);

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});
