import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("should render title and description", () => {
    render(<EmptyState title="No employees yet" description="Add your first teammate." />);

    expect(screen.getByText("No employees yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first teammate.")).toBeInTheDocument();
  });

  it("should render an optional action", () => {
    render(<EmptyState title="Empty" action={<button>Add</button>} />);

    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
