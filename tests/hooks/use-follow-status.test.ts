import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

// Mock fetch for api calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock supabase client (unused by hook, mocked for parity)
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {},
  }),
}));

// Import after mocks
const { useFollowStatus } = await import("@/lib/hooks/use-follow-status");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  });
});

describe("useFollowStatus", () => {
  describe("initial state", () => {
    it("should return default state when no session is present", async () => {
      const { result } = renderHook(() => useFollowStatus("user-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isOwnProfile).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(typeof result.current.setFollowing).toBe("function");
      expect(typeof result.current.setPending).toBe("function");
      expect(typeof result.current.setUnfollowed).toBe("function");
    });

    it("should not fetch when no session is present", async () => {
      const { result } = renderHook(() => useFollowStatus("user-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("own profile detection", () => {
    it("should set isOwnProfile when target userId matches profile.id", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
        profile: { id: "me-1", username: "me" } as never,
      });

      const { result } = renderHook(() => useFollowStatus("me-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(result.current.isOwnProfile).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      // Own profile short-circuits the fetch
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should not set isOwnProfile when target userId does not match", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
        profile: { id: "me-1", username: "me" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { isFollowing: false } }),
      });

      const { result } = renderHook(() => useFollowStatus("other-user"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(result.current.isOwnProfile).toBe(false);
    });
  });

  describe("authenticated fetch", () => {
    it("should call the profile endpoint when authenticated and not own profile", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
        profile: { id: "me-1", username: "me" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { isFollowing: true } }),
      });

      const { result } = renderHook(() => useFollowStatus("other-user"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/profile/other-user"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle fetch failures gracefully", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
        profile: { id: "me-1", username: "me" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: "Server error" } }),
      });

      const { result } = renderHook(() => useFollowStatus("other-user"));

      // Error is swallowed — hook still hydrates
      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isPending).toBe(false);
    });
  });

  describe("state setters", () => {
    it("setFollowing should mark as following and not pending", async () => {
      const { result } = renderHook(() => useFollowStatus("user-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      act(() => {
        result.current.setFollowing();
      });

      expect(result.current.isFollowing).toBe(true);
      expect(result.current.isPending).toBe(false);
    });

    it("setPending should mark as pending and not following", async () => {
      const { result } = renderHook(() => useFollowStatus("user-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      act(() => {
        result.current.setPending();
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.isFollowing).toBe(false);
    });

    it("setUnfollowed should clear both following and pending", async () => {
      const { result } = renderHook(() => useFollowStatus("user-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      act(() => {
        result.current.setFollowing();
      });
      expect(result.current.isFollowing).toBe(true);

      act(() => {
        result.current.setUnfollowed();
      });

      expect(result.current.isFollowing).toBe(false);
      expect(result.current.isPending).toBe(false);
    });
  });
});
