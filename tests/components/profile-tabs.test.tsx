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

const { ProfileTabs } = await import("@/components/profile/profile-tabs");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: { id: "u1" } as never,
    profile: { id: "p1", username: "testuser" } as never,
    isLoading: false,
  });
});

describe("ProfileTabs", () => {
  it("should render all 5 tabs", () => {
    // Mock diary fetch for default tab
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<ProfileTabs username="testuser" />);

    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Currently Reading")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("Lists")).toBeInTheDocument();
    expect(screen.getByText("Want to Read")).toBeInTheDocument();
  });

  it("should show empty state for read tab when no books", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<ProfileTabs username="testuser" />);

    await waitFor(() => {
      expect(
        screen.getByText("testuser hasn't read any books yet."),
      ).toBeInTheDocument();
    });
  });

  it("should fetch reviews when Reviews tab is clicked", async () => {
    // First: diary fetch for default tab
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<ProfileTabs username="testuser" />);

    // Reviews fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    fireEvent.click(screen.getByText("Reviews"));

    await waitFor(() => {
      expect(
        screen.getByText("testuser hasn't written any reviews yet."),
      ).toBeInTheDocument();
    });
  });

  it("should fetch lists when Lists tab is clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<ProfileTabs username="testuser" />);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    fireEvent.click(screen.getByText("Lists"));

    await waitFor(() => {
      expect(
        screen.getByText("testuser hasn't created any lists yet."),
      ).toBeInTheDocument();
    });
  });

  it("should render book covers when diary has entries", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "ub-1",
              bookId: "b-1",
              status: "read",
              rating: "4.5",
              book: { id: "b-1", title: "Test Book", coverUrl: "/cover.jpg" },
            },
          ],
        }),
    });

    render(<ProfileTabs username="testuser" />);

    await waitFor(() => {
      expect(screen.getByAltText("Test Book")).toBeInTheDocument();
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });
  });
});
