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

const { WantToReadButton } =
  await import("@/components/book/want-to-read-button");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  });
  useBookStatusStore.setState({ statuses: {}, hydrated: {} });
  fetchingBooks.clear();
});

describe("WantToReadButton", () => {
  it("should show Want to Read when not authenticated", () => {
    render(<WantToReadButton bookId="book-1" />);

    expect(screen.getByText("Want to Read")).toBeInTheDocument();
  });

  it("should show spinner while hydrating when authenticated", () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    // Don't resolve the status fetch yet
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<WantToReadButton bookId="book-1" />);

    // Should show loading spinner
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should show Want to Read after hydrating with no status", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    // Status fetch returns null (no status)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<WantToReadButton bookId="book-1" />);

    await waitFor(() => {
      expect(screen.getByText("Want to Read")).toBeInTheDocument();
    });
  });

  it("should show Added to Reading List after hydrating with want_to_read status", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ data: { status: "want_to_read", rating: null } }),
    });

    render(<WantToReadButton bookId="book-1" />);

    await waitFor(() => {
      expect(screen.getByText("Added to Reading List")).toBeInTheDocument();
    });
  });

  it("should call POST on click to add, then show Added", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    // First call: hydration status fetch → no status
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<WantToReadButton bookId="book-1" />);

    await waitFor(() => {
      expect(screen.getByText("Want to Read")).toBeInTheDocument();
    });

    // Second call: POST to add status
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { status: "want_to_read" } }),
    });

    fireEvent.click(screen.getByText("Want to Read"));

    await waitFor(() => {
      expect(screen.getByText("Added to Reading List")).toBeInTheDocument();
    });
  });
});
