import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { RatingHistogram } from "@/components/book/rating-histogram";

describe("RatingHistogram", () => {
  const defaultHistogram: Record<string, number> = {
    "0.5": 1,
    "1.0": 2,
    "1.5": 3,
    "2.0": 5,
    "2.5": 8,
    "3.0": 15,
    "3.5": 20,
    "4.0": 30,
    "4.5": 25,
    "5.0": 10,
  };

  it("should render average rating", () => {
    render(
      <RatingHistogram
        histogram={defaultHistogram}
        avgRating={3.8}
        ratingsCount={119}
      />,
    );

    expect(screen.getByText("3.8")).toBeInTheDocument();
  });

  it("should render ratings count", () => {
    render(
      <RatingHistogram
        histogram={defaultHistogram}
        avgRating={3.8}
        ratingsCount={119}
      />,
    );

    expect(screen.getByText("119 ratings")).toBeInTheDocument();
  });

  it("should render dash when no rating", () => {
    render(
      <RatingHistogram histogram={{}} avgRating={null} ratingsCount={0} />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("0 ratings")).toBeInTheDocument();
  });

  it("should render all 5 star rows", () => {
    const { container } = render(
      <RatingHistogram
        histogram={defaultHistogram}
        avgRating={3.8}
        ratingsCount={119}
      />,
    );

    // 5 bar rows, each with a star label + bar + count
    const bars = container.querySelectorAll(".bg-shelvitas-orange");
    expect(bars.length).toBeGreaterThanOrEqual(5);
  });
});
