import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";

describe("Card", () => {
  it("should render title, description and content together", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>People in your company</CardDescription>
        </CardHeader>
        <CardContent>128 employees</CardContent>
      </Card>
    );

    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("People in your company")).toBeInTheDocument();
    expect(screen.getByText("128 employees")).toBeInTheDocument();
  });

  it("should apply extra className to the card root", () => {
    render(<Card data-testid="card" className="mt-4" />);

    expect(screen.getByTestId("card").className).toContain("mt-4");
  });
});
