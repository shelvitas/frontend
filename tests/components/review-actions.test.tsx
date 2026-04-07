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

  it("should call exact like URL with POST, auth header, no Content-Type", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(
      <ReviewActions reviewId="rev-42" initialLikes={5} initialSaves={1} />,
    );

    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("http://localhost:4000/v1/reviews/rev-42/like");
      expect(options.method).toBe("POST");
      expect(options.headers.Authorization).toBe("Bearer test-jwt");
      expect(options.headers["Content-Type"]).toBeUndefined();
      expect(options.body).toBeUndefined();
    });
  });

  it("should optimistically increment like count", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(<ReviewActions reviewId="r1" initialLikes={5} initialSaves={1} />);

    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      expect(screen.getByText("6")).toBeInTheDocument();
    });
  });

  it("should revert like count on API failure", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ReviewActions reviewId="r1" initialLikes={5} initialSaves={1} />);

    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("should call exact save URL with POST, no Content-Type", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(
      <ReviewActions reviewId="rev-42" initialLikes={5} initialSaves={1} />,
    );

    fireEvent.click(screen.getByText("1"));

    await waitFor(() => {
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("http://localhost:4000/v1/reviews/rev-42/save");
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBeUndefined();
    });
  });

  it("should call DELETE when unliking", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    // First like
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });
    render(<ReviewActions reviewId="r1" initialLikes={5} initialSaves={1} />);
    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    // Now unlike
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });
    fireEvent.click(screen.getByText("6"));

    await waitFor(() => {
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      expect(lastCall[1].method).toBe("DELETE");
    });
  });
});
