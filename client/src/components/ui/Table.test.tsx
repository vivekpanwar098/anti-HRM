import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table, TBody, TD, TH, THead, TR } from "./Table";

describe("Table", () => {
  it("should render headers and cell data", () => {
    render(
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Department</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>Anshul Gusain</TD>
            <TD>Engineering</TD>
          </TR>
        </TBody>
      </Table>
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("Anshul Gusain")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });
});
