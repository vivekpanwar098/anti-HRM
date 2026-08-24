import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

const logoutMock = vi.fn();

vi.mock("@/features/auth/hooks/useAuth", () => ({
  default: () => ({
    user: { name: "Priya Sharma", role: "employee" },
    logout: logoutMock,
  }),
}));

describe("Header", () => {
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it("should show the user's initials when there is no profile image", () => {
    render(<Header openSidebar={() => {}} />);

    expect(screen.getByText("PS")).toBeInTheDocument();
  });

  it("should open the profile dropdown on click", async () => {
    render(<Header openSidebar={() => {}} />);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Profile menu" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
  });

  it("should close the dropdown after clicking Logout and call logout", async () => {
    render(<Header openSidebar={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Logout" }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
