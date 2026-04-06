import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));

const { ReviewActions } = await import("@/components/review/review-actions");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  });
});

describe("ReviewActions", () => {
  it("should render like and save counts", () => {
    render(<ReviewActions reviewId="r1" initialLikes={12} initialSaves={3} />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should call like API when authenticated", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(<ReviewActions reviewId="r1" initialLikes={5} initialSaves={1} />);

    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/reviews/r1/like"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("should call save API when authenticated", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(<ReviewActions reviewId="r1" initialLikes={5} initialSaves={1} />);

    fireEvent.click(screen.getByText("1"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/reviews/r1/save"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
