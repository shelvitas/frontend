import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";
import { useBookStatusStore } from "@/lib/hooks/use-book-status";

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
});

describe("StatusControls", () => {
  it("should render nothing when not authenticated", () => {
    const { container } = render(<StatusControls bookId="book-1" />);

    // Unauthenticated — WantToReadButton handles CTA, StatusControls returns null
    expect(container.innerHTML).toBe("");
  });

  it("should show 3 status buttons after hydration (no Want to Read)", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    // Hydration fetch returns no status
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

    // Want to Read is handled by WantToReadButton, not here
    expect(screen.queryByRole("button", { name: /Want to Read/i })).not.toBeInTheDocument();
  });

  it("should call API when clicking a status", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    // Hydration
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
    });

    // Click action — set to currently_reading
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { status: "currently_reading" } }),
    });

    fireEvent.click(screen.getByRole("button", { name: /Reading/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/books/book-1/status"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("should call DNF endpoint for DNF status", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<StatusControls bookId="book-1" />);

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
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/books/book-1/dnf"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
