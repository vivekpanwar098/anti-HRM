import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeeAuthWrapper from "./EmployeeAuthWrapper";

vi.mock("@/features/auth/hooks/useAuth", () => ({
  default: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import useAuth from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseRouter = vi.mocked(useRouter);

describe("EmployeeAuthWrapper", () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: replaceMock,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it("renders children for an employee user", () => {
    mockedUseAuth.mockReturnValue({
      user: { name: "Emp", role: "employee" },
      isAuthLoading: false,
    } as ReturnType<typeof useAuth>);

    render(
      <EmployeeAuthWrapper>
        <div>Protected Employee</div>
      </EmployeeAuthWrapper>,
    );

    expect(screen.getByText("Protected Employee")).toBeInTheDocument();
  });

  it("shows loading while auth is loading", () => {
    mockedUseAuth.mockReturnValue({ user: null, isAuthLoading: true } as ReturnType<typeof useAuth>);

    render(
      <EmployeeAuthWrapper>
        <div>Protected Employee</div>
      </EmployeeAuthWrapper>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects non-employee users to login and shows a toast", async () => {
    mockedUseAuth.mockReturnValue({
      user: { name: "A", role: "admin" },
      isAuthLoading: false,
    } as ReturnType<typeof useAuth>);

    render(
      <EmployeeAuthWrapper>
        <div>Protected Employee</div>
      </EmployeeAuthWrapper>,
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(toast.error).toHaveBeenCalledWith("Please login as employee");
    expect(screen.queryByText("Protected Employee")).not.toBeInTheDocument();
  });
});
