import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

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

// Stub navbar/footer to keep the test focused
vi.mock("@/components/layout/navbar", () => ({
  Navbar: () => null,
}));
vi.mock("@/components/layout/footer", () => ({
  Footer: () => null,
}));

// Stub the create-shelf modal so we don't pull in Radix Dialog
vi.mock("@/components/shelf/create-shelf-modal", () => ({
  CreateShelfModal: () => null,
}));

const ShelvesPageModule = await import("@/app/(protected)/shelves/page");
const ShelvesPage = ShelvesPageModule.default;

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: { id: "u1" } as never,
    profile: { id: "p1", username: "alice" } as never,
    isLoading: false,
  });
});

describe("Protected ShelvesPage", () => {
  it("should fetch from /v1/shelves on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<ShelvesPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:4000/v1/shelves");
  });

  it("should NOT fetch from /v1/lists (the old endpoint)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<ShelvesPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).not.toContain("/v1/lists");
  });

  it("should render shelves with title, bookCount, isRanked badge and likesCount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "shelf-1",
              title: "Best sci-fi",
              description: "My favourites",
              isPrivate: false,
              isRanked: true,
              bookCount: 12,
              likesCount: 47,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
            {
              id: "shelf-2",
              title: "Beach reads",
              description: null,
              isPrivate: true,
              isRanked: false,
              bookCount: 0,
              likesCount: 0,
              createdAt: "2026-01-02T00:00:00.000Z",
            },
          ],
        }),
    });

    render(<ShelvesPage />);

    await waitFor(() => {
      expect(screen.getByText("Best sci-fi")).toBeInTheDocument();
    });

    expect(screen.getByText("Beach reads")).toBeInTheDocument();
    expect(screen.getByText("My favourites")).toBeInTheDocument();
    // Book count rendering
    expect(screen.getByText(/12 books/)).toBeInTheDocument();
    expect(screen.getByText(/0 books/)).toBeInTheDocument();
    // Likes count
    expect(screen.getByText("47")).toBeInTheDocument();
    // Ranked badge appears for the ranked shelf
    expect(screen.getByText("Ranked")).toBeInTheDocument();
  });

  it("should show empty state when user has no shelves", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<ShelvesPage />);

    await waitFor(() => {
      expect(screen.getByText("No shelves yet")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Create a shelf to start curating books."),
    ).toBeInTheDocument();
  });

  it("should link each shelf to /shelves/:id (not /lists/:id)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "shelf-abc",
              title: "Test",
              description: null,
              isPrivate: false,
              isRanked: false,
              bookCount: 0,
              likesCount: 0,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        }),
    });

    const { container } = render(<ShelvesPage />);

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    const link = container.querySelector('a[href="/shelves/shelf-abc"]');
    expect(link).not.toBeNull();

    const oldLink = container.querySelector('a[href="/lists/shelf-abc"]');
    expect(oldLink).toBeNull();
  });
});
