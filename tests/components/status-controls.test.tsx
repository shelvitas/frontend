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

  it("should show 'Add to your books' dropdown trigger after hydration", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<StatusControls bookId="book-1" />);

    await waitFor(() => {
      expect(screen.getByText("Add to your books")).toBeInTheDocument();
    });
  });

  it("should show all 4 statuses in dropdown when clicked", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<StatusControls bookId="book-1" />);

    await waitFor(() => {
      expect(screen.getByText("Add to your books")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add to your books"));

    expect(screen.getByText("Want to Read")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("DNF")).toBeInTheDocument();
  });

  it("should show active status label when a status is set", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { status: "currently_reading" } }),
    });

    render(<StatusControls bookId="book-42" />);

    await waitFor(() => {
      expect(screen.getByText("Reading")).toBeInTheDocument();
    });
  });

  it("should send POST when selecting a status from dropdown", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    render(<StatusControls bookId="book-42" />);

    await waitFor(() => {
      expect(screen.getByText("Add to your books")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { status: "read" } }),
    });

    fireEvent.click(screen.getByText("Add to your books"));
    fireEvent.click(screen.getByText("Read"));

    await waitFor(() => {
      const { calls } = mockFetch.mock;
      const [url, options] = calls[calls.length - 1];
      expect(url).toBe("http://localhost:4000/v1/books/book-42/status");
      expect(options.method).toBe("POST");
    });
  });
});
