import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "./Spinner";

describe("Spinner", () => {
  it("should expose a loading status for screen readers", () => {
    render(<Spinner />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
  });
});
