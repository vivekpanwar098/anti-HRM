import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal", () => {
  it("should render nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Invite">
        <p>Body</p>
      </Modal>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render title and children when open", () => {
    render(
      <Modal open onClose={() => {}} title="Invite teammate">
        <p>Body</p>
      </Modal>
    );

    expect(screen.getByRole("dialog", { name: "Invite teammate" })).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("should call onClose when Escape is pressed", async () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} title="Invite">
        <p>Body</p>
      </Modal>
    );
    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} title="Invite">
        <p>Body</p>
      </Modal>
    );
    await userEvent.click(screen.getByTestId("modal-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
