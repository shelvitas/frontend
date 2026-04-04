import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { ReviewCard } from "@/components/book/review-card";
import type { BookReview } from "@/lib/types";

const baseReview: BookReview = {
  id: "review-1",
  body: "This was an incredible book. Highly recommend!",
  rating: 4.5,
  containsSpoilers: false,
  isDnf: false,
  likesCount: 12,
  commentsCount: 3,
  createdAt: "2024-01-15",
  reviewer: {
    username: "bookworm",
    displayName: "Book Worm",
    avatarUrl: null,
  },
};

describe("ReviewCard", () => {
  it("should render reviewer name and review body", () => {
    render(<ReviewCard review={baseReview} />);

    expect(screen.getByText("Book Worm")).toBeInTheDocument();
    expect(
      screen.getByText("This was an incredible book. Highly recommend!"),
    ).toBeInTheDocument();
  });

  it("should render like and comment counts", () => {
    render(<ReviewCard review={baseReview} />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should show DNF badge for DNF reviews", () => {
    render(<ReviewCard review={{ ...baseReview, isDnf: true }} />);

    expect(screen.getByText("DNF")).toBeInTheDocument();
  });

  it("should show spoiler warning instead of body", () => {
    render(
      <ReviewCard review={{ ...baseReview, containsSpoilers: true }} />,
    );

    expect(
      screen.getByText("This review contains spoilers."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("This was an incredible book. Highly recommend!"),
    ).not.toBeInTheDocument();
  });

  it("should truncate long reviews", () => {
    const longBody = "A".repeat(400);
    render(<ReviewCard review={{ ...baseReview, body: longBody }} />);

    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
  });
});
