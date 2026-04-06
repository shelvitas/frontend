import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { ShareButtons } from "@/components/review/share-buttons";

describe("ShareButtons", () => {
  it("should render X and Threads share links", () => {
    render(<ShareButtons url="https://shelvitas.com/reviews/1" text="Great review" />);

    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("Threads")).toBeInTheDocument();
  });

  it("should have correct X share URL", () => {
    render(<ShareButtons url="https://shelvitas.com/reviews/1" text="Great review" />);

    const xLink = screen.getByText("X").closest("a");
    expect(xLink?.href).toContain("twitter.com/intent/tweet");
    expect(xLink?.href).toContain("Great%20review");
  });

  it("should have correct Threads share URL", () => {
    render(<ShareButtons url="https://shelvitas.com/reviews/1" text="Great review" />);

    const threadsLink = screen.getByText("Threads").closest("a");
    expect(threadsLink?.href).toContain("threads.net/intent/post");
  });

  it("should show Share label", () => {
    render(<ShareButtons url="https://example.com" text="test" />);

    expect(screen.getByText("Share")).toBeInTheDocument();
  });
});
