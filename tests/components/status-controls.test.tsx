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

const { StatusControls } = await import("@/components/book/status-controls");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  });
});

describe("StatusControls", () => {
  it("should show Want to Read button when not authenticated", () => {
    render(<StatusControls bookId="book-1" initialStatus={null} />);

    expect(
      screen.getByRole("button", { name: /Want to Read/i }),
    ).toBeInTheDocument();
  });

  it("should show all 4 status buttons when authenticated", () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    render(<StatusControls bookId="book-1" initialStatus={null} />);

    expect(
      screen.getByRole("button", { name: /Want to Read/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reading/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Read$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /DNF/i })).toBeInTheDocument();
  });

  it("should call API when clicking a status", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { status: "want_to_read" } }),
    });

    render(<StatusControls bookId="book-1" initialStatus={null} />);

    fireEvent.click(screen.getByRole("button", { name: /Want to Read/i }));

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
      status: 201,
      json: () => Promise.resolve({ data: { status: "did_not_finish" } }),
    });

    render(<StatusControls bookId="book-1" initialStatus={null} />);

    fireEvent.click(screen.getByRole("button", { name: /DNF/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/books/book-1/dnf"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
