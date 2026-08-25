import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAuthWrapper from "./AdminAuthWrapper";

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

describe("AdminAuthWrapper", () => {
	const replaceMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockedUseRouter.mockReturnValue({ replace: replaceMock } as unknown as ReturnType<typeof useRouter>);
	});

	it("renders children for an admin user", () => {
		mockedUseAuth.mockReturnValue({ user: { name: "Admin", role: "admin" }, isAuthLoading: false } as ReturnType<typeof useAuth>);

		render(
			<AdminAuthWrapper>
				<div>Protected Content</div>
			</AdminAuthWrapper>,
		);

		expect(screen.getByText("Protected Content")).toBeInTheDocument();
	});

	it("shows loading while auth is loading", () => {
		mockedUseAuth.mockReturnValue({ user: null, isAuthLoading: true } as ReturnType<typeof useAuth>);

		render(
			<AdminAuthWrapper>
				<div>Protected Content</div>
			</AdminAuthWrapper>,
		);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("redirects non-admin users to login and shows a toast", async () => {
		mockedUseAuth.mockReturnValue({ user: { name: "E", role: "employee" }, isAuthLoading: false } as ReturnType<typeof useAuth>);

		render(
			<AdminAuthWrapper>
				<div>Protected Content</div>
			</AdminAuthWrapper>,
		);

		await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
		expect(toast.error).toHaveBeenCalledWith("Please login as admin");
		expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
	});
});
