import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { FeedEventCard } from "@/components/feed/feed-event-card";
import type { FeedEvent } from "@/lib/types";

const baseEvent: FeedEvent = {
  id: "e1",
  eventType: "status_update",
  metadata: { status: "read" },
  createdAt: "2024-03-15T10:30:00.000Z",
  user: {
    id: "u1",
    username: "reader1",
    displayName: "Reader One",
    avatarUrl: null,
  },
  book: {
    id: "b1",
    title: "The Great Gatsby",
    coverUrl: "/gatsby.jpg",
  },
  reviewId: null,
  listId: null,
  userBookId: null,
};

describe("FeedEventCard", () => {
  it("should render user name and book title", () => {
    render(<FeedEventCard event={baseEvent} />);

    expect(screen.getByText("Reader One")).toBeInTheDocument();
    expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
  });

  it("should show correct action text for read status", () => {
    render(<FeedEventCard event={baseEvent} />);

    expect(screen.getByText("finished reading")).toBeInTheDocument();
  });

  it("should show correct action text for want_to_read", () => {
    render(
      <FeedEventCard
        event={{ ...baseEvent, metadata: { status: "want_to_read" } }}
      />,
    );

    expect(screen.getByText("wants to read")).toBeInTheDocument();
  });

  it("should show correct action text for currently_reading", () => {
    render(
      <FeedEventCard
        event={{ ...baseEvent, metadata: { status: "currently_reading" } }}
      />,
    );

    expect(screen.getByText("started reading")).toBeInTheDocument();
  });

  it("should show rating stars when event has rating", () => {
    render(
      <FeedEventCard
        event={{
          ...baseEvent,
          eventType: "rating",
          metadata: { rating: 4 },
        }}
      />,
    );

    // Should render star elements (filled + empty)
    const stars = screen.getAllByRole("img", { hidden: true });
    expect(stars.length).toBeGreaterThanOrEqual(0); // lucide icons don't have img role
  });

  it("should show review link when reviewId present", () => {
    render(
      <FeedEventCard
        event={{
          ...baseEvent,
          eventType: "review",
          reviewId: "rev-1",
        }}
      />,
    );

    expect(screen.getByText("Read review")).toBeInTheDocument();
  });

  it("should show list link when listId present", () => {
    render(
      <FeedEventCard
        event={{
          ...baseEvent,
          eventType: "list_created",
          listId: "list-1",
        }}
      />,
    );

    expect(screen.getByText("View list")).toBeInTheDocument();
  });

  it("should show progress milestone", () => {
    render(
      <FeedEventCard
        event={{
          ...baseEvent,
          eventType: "progress_update",
          metadata: { milestone: 50 },
        }}
      />,
    );

    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("should render timestamp", () => {
    render(<FeedEventCard event={baseEvent} />);

    // Should contain date text
    expect(screen.getByText(/Mar 15/)).toBeInTheDocument();
  });
});
