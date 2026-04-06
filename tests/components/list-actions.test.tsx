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

const { ListActions } = await import("@/components/list/list-actions");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  });
});

describe("ListActions", () => {
  it("should render like count and action buttons", () => {
    render(
      <ListActions
        listId="l1"
        initialLikes={5}
        initialIsLiked={false}
        listTitle="My List"
      />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Clone")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("should call like API when authenticated", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(
      <ListActions
        listId="l1"
        initialLikes={5}
        initialIsLiked={false}
        listTitle="My List"
      />,
    );

    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/lists/l1/like"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("should call unlike when already liked", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(
      <ListActions
        listId="l1"
        initialLikes={5}
        initialIsLiked
        listTitle="My List"
      />,
    );

    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/lists/l1/like"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("should call clone API", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "l-cloned" } }),
    });

    render(
      <ListActions
        listId="l1"
        initialLikes={5}
        initialIsLiked={false}
        listTitle="My List"
      />,
    );

    fireEvent.click(screen.getByText("Clone"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/lists/l1/clone"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
