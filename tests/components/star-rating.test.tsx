import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { StarRating } from "@/components/book/star-rating";

describe("StarRating", () => {
  it("should render 5 star buttons", () => {
    render(<StarRating value={null} onChange={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("should display numeric value when rating is set", () => {
    render(<StarRating value={3.5} onChange={vi.fn()} />);

    expect(screen.getByText("3.5")).toBeInTheDocument();
  });

  it("should not display numeric value when rating is null", () => {
    render(<StarRating value={null} onChange={vi.fn()} />);

    expect(screen.queryByText(/\d\.\d/)).not.toBeInTheDocument();
  });

  it("should call onChange when clicking a star", () => {
    const onChange = vi.fn();
    render(<StarRating value={null} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("3 stars"));

    expect(onChange).toHaveBeenCalled();
  });

  it("should clear rating when clicking the same value", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("3 stars"));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("should not respond to clicks when readOnly", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);

    fireEvent.click(screen.getByLabelText("3 stars"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should have radiogroup role", () => {
    render(<StarRating value={null} onChange={vi.fn()} />);

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });
});
