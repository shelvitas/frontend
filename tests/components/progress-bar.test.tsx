import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/some-path",
}));

const { ProgressBar } = await import("@/components/layout/progress-bar");

describe("ProgressBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render without crashing", () => {
    const { container } = render(<ProgressBar />);
    // After mount, loading starts and progress=30 so bar is rendered
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render the fixed top progress bar wrapper", () => {
    const { container } = render(<ProgressBar />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass("fixed");
    expect(wrapper).toHaveClass("top-0");
    expect(wrapper).toHaveClass("left-0");
    expect(wrapper).toHaveClass("right-0");
  });

  it("should render the green progress bar inner element", () => {
    const { container } = render(<ProgressBar />);

    const bar = container.querySelector(".bg-shelvitas-green");
    expect(bar).toBeInTheDocument();
  });

  it("should start at 30% width when first mounted", () => {
    const { container } = render(<ProgressBar />);

    const bar = container.querySelector(
      ".bg-shelvitas-green",
    ) as HTMLElement | null;
    expect(bar?.style.width).toBe("30%");
  });

  it("should progress to 60% after 100ms", () => {
    const { container } = render(<ProgressBar />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const bar = container.querySelector(
      ".bg-shelvitas-green",
    ) as HTMLElement | null;
    expect(bar?.style.width).toBe("60%");
  });

  it("should progress to 80% after 300ms", () => {
    const { container } = render(<ProgressBar />);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const bar = container.querySelector(
      ".bg-shelvitas-green",
    ) as HTMLElement | null;
    expect(bar?.style.width).toBe("80%");
  });

  it("should progress to 100% after 500ms", () => {
    const { container } = render(<ProgressBar />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const bar = container.querySelector(
      ".bg-shelvitas-green",
    ) as HTMLElement | null;
    expect(bar?.style.width).toBe("100%");
  });

  it("should unmount the bar after the full 700ms sequence", () => {
    const { container } = render(<ProgressBar />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    // After loading finishes and progress resets to 0, returns null
    expect(container.firstChild).toBeNull();
  });
});
