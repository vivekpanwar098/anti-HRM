import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  it("should render its label and call onClick when clicked", async () => {
    let clicks = 0;

    render(<Button onClick={() => { clicks += 1; }}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(clicks).toBe(1);
  });

  it("should be disabled while loading and show a spinner", () => {
    render(<Button loading>Save</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should not trigger onClick when disabled", async () => {
    let clicks = 0;

    render(<Button disabled onClick={() => { clicks += 1; }}>Save</Button>);
    await userEvent.click(screen.getByRole("button"));

    expect(clicks).toBe(0);
  });
});
