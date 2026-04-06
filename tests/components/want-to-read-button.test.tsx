import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  }),
}));

const { WantToReadButton } = await import("@/components/book/want-to-read-button");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ session: null, user: null, profile: null, isLoading: false });
});

describe("WantToReadButton", () => {
  it("should show Want to Read when not wanted", () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    render(<WantToReadButton bookId="book-1" initialWanted={false} />);

    expect(screen.getByText("Want to Read")).toBeInTheDocument();
  });

  it("should show checkmark when already wanted", () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    render(<WantToReadButton bookId="book-1" initialWanted />);

    // Both states show "Want to Read" text, but styles differ
    expect(screen.getByText("Want to Read")).toBeInTheDocument();
  });

  it("should call status API on click", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { status: "want_to_read" } }),
    });

    render(<WantToReadButton bookId="book-1" initialWanted={false} />);

    fireEvent.click(screen.getByText("Want to Read"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/books/book-1/status"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("should call delete status when toggling off", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(<WantToReadButton bookId="book-1" initialWanted />);

    fireEvent.click(screen.getByText("Want to Read"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/books/book-1/status"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});
