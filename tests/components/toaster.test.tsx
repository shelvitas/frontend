import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { ToastProvider, useToast } from "@/components/ui/toaster";

const Trigger = ({
  message,
  type,
}: {
  message: string;
  type?: "success" | "error" | "info";
}) => {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast(message, type)}>
      fire
    </button>
  );
};

describe("Toaster", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render children without a toast initially", () => {
    render(
      <ToastProvider>
        <div>child content</div>
      </ToastProvider>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("should show a toast when triggered", () => {
    render(
      <ToastProvider>
        <Trigger message="Saved!" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));

    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("should render success toast with success colors", () => {
    const { container } = render(
      <ToastProvider>
        <Trigger message="All good" type="success" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));

    const toast = container.querySelector(".bg-shelvitas-green\\/10");
    expect(toast).toBeInTheDocument();
  });

  it("should render error toast with red colors", () => {
    const { container } = render(
      <ToastProvider>
        <Trigger message="Uh oh" type="error" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));

    const toast = container.querySelector(".bg-red-500\\/10");
    expect(toast).toBeInTheDocument();
  });

  it("should render info toast with blue colors", () => {
    const { container } = render(
      <ToastProvider>
        <Trigger message="FYI" type="info" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));

    const toast = container.querySelector(".bg-shelvitas-blue\\/10");
    expect(toast).toBeInTheDocument();
  });

  it("should auto-dismiss the toast after 3 seconds", () => {
    render(
      <ToastProvider>
        <Trigger message="Auto goes away" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));
    expect(screen.getByText("Auto goes away")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("Auto goes away")).not.toBeInTheDocument();
  });

  it("should dismiss the toast when the X button is clicked", () => {
    render(
      <ToastProvider>
        <Trigger message="Close me" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));
    expect(screen.getByText("Close me")).toBeInTheDocument();

    // X button is the second button inside the toast container.
    // The only other button in the tree is our trigger. Find by its svg sibling.
    const buttons = screen.getAllByRole("button");
    // First button is "fire" (Trigger), second is dismiss X.
    fireEvent.click(buttons[1]);

    expect(screen.queryByText("Close me")).not.toBeInTheDocument();
  });

  it("should support stacking multiple toasts", () => {
    render(
      <ToastProvider>
        <Trigger message="first" />
      </ToastProvider>,
    );

    const fire = screen.getByText("fire");
    fireEvent.click(fire);
    fireEvent.click(fire);

    expect(screen.getAllByText("first")).toHaveLength(2);
  });
});
