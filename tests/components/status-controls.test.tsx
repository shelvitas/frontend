import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";
import { useBookStatusStore, fetchingBooks } from "@/lib/hooks/use-book-status";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));

const { StatusControls } = await import("@/components/book/status-controls");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  });
  useBookStatusStore.setState({ statuses: {}, hydrated: {} });
  fetchingBooks.clear();
});

describe("StatusControls", () => {
  it("should render nothing when not authenticated", () => {
    const { container } = render(<StatusControls bookId="book-1" />);
    expect(container.innerHTML).toBe("");
  });

  it("should show 3 status buttons after hydration (Reading, Read, DNF)", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<StatusControls bookId="book-1" />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Reading/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^Read$/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /DNF/i })).toBeInTheDocument();
    });

    // Want to Read is NOT here — handled by WantToReadButton
    expect(
      screen.queryByRole("button", { name: /Want to Read/i }),
    ).not.toBeInTheDocument();
  });

  it("should send correct URL, method, body, and headers for Reading status", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    // Hydration fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<StatusControls bookId="book-42" />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Reading/i }),
      ).toBeInTheDocument();
    });

    // Status change fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { status: "currently_reading" } }),
    });

    fireEvent.click(screen.getByRole("button", { name: /Reading/i }));

    await waitFor(() => {
      const { calls } = mockFetch.mock;
      const [url, options] = calls[calls.length - 1];
      // Exact URL
      expect(url).toBe("http://localhost:4000/v1/books/book-42/status");
      // POST method
      expect(options.method).toBe("POST");
      // Auth header
      expect(options.headers.Authorization).toBe("Bearer test-jwt");
      // Correct body with Content-Type
      expect(options.headers["Content-Type"]).toBe("application/json");
      const body = JSON.parse(options.body);
      expect(body.status).toBe("currently_reading");
    });
  });

  it("should send POST to /dnf endpoint for DNF status", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<StatusControls bookId="book-42" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /DNF/i })).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { status: "did_not_finish" } }),
    });

    fireEvent.click(screen.getByRole("button", { name: /DNF/i }));

    await waitFor(() => {
      const { calls } = mockFetch.mock;
      const [url, options] = calls[calls.length - 1];
      // DNF uses different endpoint
      expect(url).toBe("http://localhost:4000/v1/books/book-42/dnf");
      expect(options.method).toBe("POST");
      const body = JSON.parse(options.body);
      expect(body.reason).toBe("not_for_me");
    });
  });

  it("should send DELETE with no body and no Content-Type when toggling off", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    // Hydration: user has currently_reading status
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { status: "currently_reading" } }),
    });

    render(<StatusControls bookId="book-42" />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Reading/i }),
      ).toBeInTheDocument();
    });

    // Toggle off
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    fireEvent.click(screen.getByRole("button", { name: /Reading/i }));

    await waitFor(() => {
      const { calls } = mockFetch.mock;
      const [url, options] = calls[calls.length - 1];
      expect(url).toBe("http://localhost:4000/v1/books/book-42/status");
      expect(options.method).toBe("DELETE");
      // No Content-Type for empty body
      expect(options.headers["Content-Type"]).toBeUndefined();
      expect(options.body).toBeUndefined();
    });
  });
});
