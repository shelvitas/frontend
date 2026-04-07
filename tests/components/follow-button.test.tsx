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

const { FollowButton } = await import("@/components/profile/follow-button");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  });
});

describe("FollowButton", () => {
  it("should show Follow button when not authenticated", () => {
    render(
      <FollowButton
        userId="user-1"
        initialIsFollowing={null}
        isPrivate={false}
      />,
    );
    expect(screen.getByRole("button", { name: /Follow/i })).toBeInTheDocument();
  });

  it("should show Request for private profiles when authenticated", () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });
    render(
      <FollowButton userId="user-1" initialIsFollowing={false} isPrivate />,
    );
    expect(screen.getByRole("button", { name: "Request" })).toBeInTheDocument();
  });

  it("should show Following when already following", () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });
    render(
      <FollowButton userId="user-1" initialIsFollowing isPrivate={false} />,
    );
    expect(
      screen.getByRole("button", { name: "Following" }),
    ).toBeInTheDocument();
  });

  it("should call exact follow URL with POST, auth header, and no Content-Type", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "f1", status: "active" } }),
    });

    render(
      <FollowButton
        userId="user-42"
        initialIsFollowing={false}
        isPrivate={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Follow/i }));

    await waitFor(() => {
      const [url, options] = mockFetch.mock.calls[0];
      // Exact URL with user ID
      expect(url).toBe("http://localhost:4000/v1/users/user-42/follow");
      // POST method
      expect(options.method).toBe("POST");
      // Auth header present
      expect(options.headers.Authorization).toBe("Bearer test-jwt");
      // No Content-Type for empty body POST
      expect(options.headers["Content-Type"]).toBeUndefined();
      // No body
      expect(options.body).toBeUndefined();
    });
  });

  it("should update UI to Following after successful follow", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "f1", status: "active" } }),
    });

    render(
      <FollowButton
        userId="user-1"
        initialIsFollowing={false}
        isPrivate={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Follow/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Following" }),
      ).toBeInTheDocument();
    });
  });

  it("should show Requested for pending follow on private profile", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "f1", status: "pending" } }),
    });

    render(
      <FollowButton userId="user-1" initialIsFollowing={false} isPrivate />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Request" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Requested" }),
      ).toBeInTheDocument();
    });
  });

  it("should call exact unfollow URL with DELETE and no Content-Type", async () => {
    useAuthStore.setState({ session: { access_token: "test-jwt" } as never });

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(
      <FollowButton userId="user-42" initialIsFollowing isPrivate={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Following" }));

    await waitFor(() => {
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("http://localhost:4000/v1/users/user-42/follow");
      expect(options.method).toBe("DELETE");
      expect(options.headers.Authorization).toBe("Bearer test-jwt");
      expect(options.headers["Content-Type"]).toBeUndefined();
    });
  });

  it("should revert to Following if unfollow fails", async () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <FollowButton userId="user-1" initialIsFollowing isPrivate={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Following" }));

    // Should temporarily show Follow (optimistic)
    await waitFor(() => {
      // Should revert back to Following after error
      expect(
        screen.getByRole("button", { name: "Following" }),
      ).toBeInTheDocument();
    });
  });
});
