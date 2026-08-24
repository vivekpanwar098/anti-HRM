import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import AuthProvider from "@/context/AuthContext";
import useAuth from "./useAuth";

vi.mock("@/services/axios", () => ({
  default: { post: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useAuth", () => {
  it("should return the auth context when used inside the AuthProvider", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current).toMatchObject({
      user: null,
      isAuthLoading: false,
    });
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });
});
