import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("should render without crashing", () => {
    render(<Checkbox checked={false} onChange={vi.fn()} label="Accept" />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("should render the label text", () => {
    render(
      <Checkbox
        checked={false}
        onChange={vi.fn()}
        label="Subscribe to newsletter"
      />,
    );

    expect(screen.getByText("Subscribe to newsletter")).toBeInTheDocument();
  });

  it("should render unchecked state with aria-checked=false", () => {
    render(<Checkbox checked={false} onChange={vi.fn()} label="Option" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("should render checked state with aria-checked=true", () => {
    render(<Checkbox checked onChange={vi.fn()} label="Option" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("should show the check icon when checked", () => {
    const { container } = render(
      <Checkbox checked onChange={vi.fn()} label="Option" />,
    );

    // lucide-react Check icon renders an svg
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should not show the check icon when unchecked", () => {
    const { container } = render(
      <Checkbox checked={false} onChange={vi.fn()} label="Option" />,
    );

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("should call onChange with !checked when clicked from unchecked", () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Option" />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should call onChange with !checked when clicked from checked", () => {
    const onChange = vi.fn();
    render(<Checkbox checked onChange={onChange} label="Option" />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("should apply the id prop when provided", () => {
    render(
      <Checkbox
        checked={false}
        onChange={vi.fn()}
        label="Option"
        id="my-check"
      />,
    );

    expect(screen.getByRole("checkbox")).toHaveAttribute("id", "my-check");
  });
});
