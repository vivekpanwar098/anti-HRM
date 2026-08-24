import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider, { AuthContext } from "./AuthContext";
import useAuth from "@/features/auth/hooks/useAuth";

vi.mock("@/services/axios", () => ({
  default: { post: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import api from "@/services/axios";
import { toast } from "sonner";

const postMock = api.post as unknown as ReturnType<typeof vi.fn>;

describe("AuthProvider", () => {
  beforeEach(() => {
    postMock.mockReset();
    vi.clearAllMocks();
  });

  it("should start with no authenticated user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthLoading).toBe(false);
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });

  it("should set the user and show a welcome toast after a successful login", async () => {
    postMock.mockResolvedValue({
      data: { user: { name: "Priya Sharma", role: "employee" } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login("priya@antibikli.com", "secret123");
    });

    expect(postMock).toHaveBeenCalledWith("/auth/signin", {
      email: "priya@antibikli.com",
      password: "secret123",
    });
    expect(result.current.user?.name).toBe("Priya Sharma");
    expect(toast.success).toHaveBeenCalledWith("Welcome back Priya");
  });

  it("should keep the user signed out and show an error toast when login fails", async () => {
    postMock.mockRejectedValue(new Error("401"));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login("ghost@antibikli.com", "wrong-password");
    });

    expect(result.current.user).toBeNull();
    expect(toast.error).toHaveBeenCalledWith("Incorrect email or password");
  });

  it("should clear the user on logout even if the API call fails", async () => {
    postMock.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login("priya@antibikli.com", "secret123");
    });
    expect(result.current.user).not.toBeNull();

    postMock.mockRejectedValue(new Error("network down"));
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });

  it("should toggle isAuthLoading while a request is in flight", async () => {
    let resolveRequest: (value: { data: { user: unknown } }) => void;
    postMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login("priya@antibikli.com", "secret123");
    });

    await waitFor(() => expect(result.current.isAuthLoading).toBe(true));

    await act(async () => {
      resolveRequest!({ data: { user: { name: "Priya Sharma" } } });
    });

    expect(result.current.isAuthLoading).toBe(false);
  });

  it("should expose the context through the provider tree", () => {
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => <span>{value ? "context-ready" : "no-context"}</span>}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    expect(screen.getByText("context-ready")).toBeInTheDocument();
  });
});
