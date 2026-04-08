import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

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

vi.mock("@/components/ui/toaster", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const { FavouriteBooksEditor } =
  await import("@/components/profile/favourite-books-editor");

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: { id: "u1" } as never,
    profile: { id: "p1", username: "alice" } as never,
    isLoading: false,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("FavouriteBooksEditor", () => {
  it("should render 4 slots — all empty (+) when no initial books", () => {
    render(<FavouriteBooksEditor username="alice" initialBooks={[]} />);

    // Each empty slot is a button containing a Plus icon; expect 4 of them
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("should render filled slots for initial books plus empty slots for the rest", () => {
    render(
      <FavouriteBooksEditor
        username="alice"
        initialBooks={[
          { id: "b1", title: "Dune", coverUrl: null },
          { id: "b2", title: "Foundation", coverUrl: null },
        ]}
      />,
    );

    // Filled slots render the book title fallback
    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Foundation")).toBeInTheDocument();
  });

  it("should open the search panel when an empty slot is clicked", () => {
    render(<FavouriteBooksEditor username="alice" initialBooks={[]} />);

    const emptySlots = screen.getAllByRole("button");
    fireEvent.click(emptySlots[0]);

    expect(
      screen.getByPlaceholderText("Search for a book..."),
    ).toBeInTheDocument();
  });

  it("should debounce search and call /v1/books/search with the query", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: {
            results: [{ id: "b1", title: "Dune", coverUrl: null, authors: [] }],
          },
        }),
    });

    render(<FavouriteBooksEditor username="alice" initialBooks={[]} />);

    const emptySlots = screen.getAllByRole("button");
    fireEvent.click(emptySlots[0]);

    const input = screen.getByPlaceholderText("Search for a book...");
    fireEvent.change(input, { target: { value: "dune" } });

    // Not immediate
    expect(mockFetch).not.toHaveBeenCalled();

    // Advance past the 400ms debounce window
    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:4000/v1/books/search?q=dune&per_page=5");
    expect(options?.method).toBeUndefined(); // GET
  });

  it("should fill a slot and PATCH /v1/profile/:username when a search result is selected", async () => {
    // First call: search
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: {
            results: [
              {
                id: "book-99",
                title: "New Book",
                coverUrl: null,
                authors: [{ name: "Author X" }],
              },
            ],
          },
        }),
    });
    // Second call: PATCH save
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { username: "alice" } }),
    });

    render(<FavouriteBooksEditor username="alice" initialBooks={[]} />);

    const emptySlots = screen.getAllByRole("button");
    fireEvent.click(emptySlots[0]);

    fireEvent.change(screen.getByPlaceholderText("Search for a book..."), {
      target: { value: "new" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });

    await waitFor(() => {
      expect(screen.getByText("New Book")).toBeInTheDocument();
    });

    // Click the result
    fireEvent.click(screen.getByText("New Book"));

    await waitFor(() => {
      // search call + save call = 2
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    const [saveUrl, saveOptions] = mockFetch.mock.calls[1];
    expect(saveUrl).toBe("http://localhost:4000/v1/profile/alice");
    expect(saveOptions.method).toBe("PATCH");

    const payload = JSON.parse(saveOptions.body);
    expect(payload.favouriteBook1Id).toBe("book-99");
    expect(payload.favouriteBook2Id).toBe(null);
    expect(payload.favouriteBook3Id).toBe(null);
    expect(payload.favouriteBook4Id).toBe(null);
  });

  it("should remove a book and PATCH with that slot set to null", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { username: "alice" } }),
    });

    render(
      <FavouriteBooksEditor
        username="alice"
        initialBooks={[
          { id: "b1", title: "Dune", coverUrl: null },
          { id: "b2", title: "Foundation", coverUrl: null },
        ]}
      />,
    );

    // The remove button is the one inside the filled slot — it has no accessible
    // name, so query by role and pick the one near Dune's slot.
    // Each filled slot renders: a Link wrapping the cover (not a button) + a
    // remove button. Empty slots render a single button. With 2 initial books
    // we expect 2 remove buttons (from filled) + 2 empty-slot buttons = 4.
    const allButtons = screen.getAllByRole("button");
    // Filled slots render the remove button; those 2 come first in DOM order
    // because the remove button is inside the filled slot wrapper, and the
    // empty-slot buttons come after.
    const duneRemoveButton = allButtons[0];
    fireEvent.click(duneRemoveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:4000/v1/profile/alice");
    expect(options.method).toBe("PATCH");

    const payload = JSON.parse(options.body);
    // Dune (slot 0) removed, Foundation (slot 1) remains
    expect(payload.favouriteBook1Id).toBe(null);
    expect(payload.favouriteBook2Id).toBe("b2");
    expect(payload.favouriteBook3Id).toBe(null);
    expect(payload.favouriteBook4Id).toBe(null);
  });

  it("should close the search panel when Cancel is clicked", () => {
    render(<FavouriteBooksEditor username="alice" initialBooks={[]} />);

    const emptySlots = screen.getAllByRole("button");
    fireEvent.click(emptySlots[0]);

    expect(
      screen.getByPlaceholderText("Search for a book..."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    expect(
      screen.queryByPlaceholderText("Search for a book..."),
    ).not.toBeInTheDocument();
  });
});
