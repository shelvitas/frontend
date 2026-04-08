import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { PageLoader } from "@/components/ui/page-loader";

describe("PageLoader", () => {
  it("should render without crashing", () => {
    const { container } = render(<PageLoader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have a centered flex wrapper", () => {
    const { container } = render(<PageLoader />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("items-center");
    expect(wrapper).toHaveClass("justify-center");
  });

  it("should render the book base and flipping pages", () => {
    const { container } = render(<PageLoader />);

    // book container has perspective style
    const book = container.querySelector('[style*="perspective"]');
    expect(book).toBeInTheDocument();
  });

  it("should render animated pages with pageFlip animation", () => {
    const { container } = render(<PageLoader />);

    const animated = container.querySelectorAll('[style*="pageFlip"]');
    // Three flipping pages (page 1, 2, 3) all share the animation
    expect(animated.length).toBeGreaterThanOrEqual(3);
  });

  it("should inject the pageFlip keyframes style tag", () => {
    const { container } = render(<PageLoader />);

    const styleTag = container.querySelector("style");
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.innerHTML).toContain("@keyframes pageFlip");
  });

  it("should render the spine shadow element", () => {
    const { container } = render(<PageLoader />);

    // Spine has bg-shelvitas-green/20 class
    const spine = container.querySelector(".bg-shelvitas-green\\/20");
    expect(spine).toBeInTheDocument();
  });
});
