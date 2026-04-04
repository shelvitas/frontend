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

const { LogModal } = await import("@/components/book/log-modal");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: { id: "u1" } as never,
    profile: { id: "p1" } as never,
    isLoading: false,
  });
});

describe("LogModal", () => {
  it("should render trigger button", () => {
    render(<LogModal bookId="book-1" bookTitle="Test Book" />);

    expect(
      screen.getByRole("button", { name: "Log / Review" }),
    ).toBeInTheDocument();
  });

  it("should show Edit Log button for existing entries", () => {
    const entry = {
      id: "ub-1",
      bookId: "book-1",
      status: "read" as const,
      rating: "4.0",
      startedAt: null,
      finishedAt: null,
      format: null,
      edition: null,
      tags: null,
      privateNotes: null,
      isReread: false,
    };

    render(
      <LogModal
        bookId="book-1"
        bookTitle="Test Book"
        existingEntry={entry}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Edit Log" }),
    ).toBeInTheDocument();
  });

  it("should open modal on trigger click and show form fields", async () => {
    render(<LogModal bookId="book-1" bookTitle="Test Book" />);

    fireEvent.click(screen.getByRole("button", { name: "Log / Review" }));

    await waitFor(() => {
      expect(screen.getByText(/Test Book/)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Want to Read/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^Read$/ }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Started")).toBeInTheDocument();
      expect(screen.getByLabelText("Finished")).toBeInTheDocument();
      expect(screen.getByLabelText("Format")).toBeInTheDocument();
      expect(screen.getByLabelText("Edition")).toBeInTheDocument();
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });
  });

  it("should show private notes toggle", async () => {
    render(<LogModal bookId="book-1" bookTitle="Test Book" />);

    fireEvent.click(screen.getByRole("button", { name: "Log / Review" }));

    await waitFor(() => {
      expect(screen.getByText(/private notes/i)).toBeInTheDocument();
    });
  });

  it("should call API to create diary entry on save", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "ub-new" } }),
    });

    render(<LogModal bookId="book-1" bookTitle="Test Book" />);

    fireEvent.click(screen.getByRole("button", { name: "Log / Review" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Log Book" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Log Book" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/diary"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("should call API to update diary entry in edit mode", async () => {
    const entry = {
      id: "ub-1",
      bookId: "book-1",
      status: "read" as const,
      rating: "4.0",
      startedAt: null,
      finishedAt: null,
      format: null,
      edition: null,
      tags: null,
      privateNotes: null,
      isReread: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { id: "ub-1" } }),
    });

    render(
      <LogModal
        bookId="book-1"
        bookTitle="Test Book"
        existingEntry={entry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Log" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Save Changes" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/diary/ub-1"),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("should show reread checkbox", async () => {
    render(<LogModal bookId="book-1" bookTitle="Test Book" />);

    fireEvent.click(screen.getByRole("button", { name: "Log / Review" }));

    await waitFor(() => {
      expect(screen.getByText("This is a reread")).toBeInTheDocument();
    });
  });
});
