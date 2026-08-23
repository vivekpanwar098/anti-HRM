import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Textarea from "./Textarea";

describe("Textarea", () => {
  it("should render a label linked to the textarea", () => {
    render(<Textarea label="Notes" defaultValue="Hello" />);

    const textarea = screen.getByLabelText("Notes") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Hello");
  });

  it("should show an error message when provided", () => {
    render(<Textarea label="Notes" error="Notes are too long" />);

    expect(screen.getByText("Notes are too long")).toBeInTheDocument();
  });
});
