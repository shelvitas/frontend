import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

// Mock fetch for api calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock supabase client (not used by this hook but keeps parity with other tests)
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {},
  }),
}));

// Import after mocks
const { useBookStatus, useBookStatusStore, fetchingBooks } =
  await import("@/lib/hooks/use-book-status");

beforeEach(() => {
  vi.clearAllMocks();
  // Reset auth store
  useAuthStore.setState({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  });
  // Reset the book status store
  useBookStatusStore.setState({
    statuses: {},
    hydrated: {},
  });
  // Clear in-flight fetch tracking
  fetchingBooks.clear();
});

describe("useBookStatus", () => {
  describe("initial state", () => {
    it("should return null/default values when nothing is cached", () => {
      const { result } = renderHook(() => useBookStatus("book-1"));

      expect(result.current.status).toBeNull();
      expect(result.current.rating).toBeNull();
      expect(result.current.currentPage).toBeNull();
      expect(result.current.currentPercent).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(typeof result.current.setStatus).toBe("function");
      expect(typeof result.current.clear).toBe("function");
    });

    it("should not fetch when no session is present", async () => {
      const { result } = renderHook(() => useBookStatus("book-1"));

      // Should mark hydrated without fetching
      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("authenticated fetch", () => {
    it("should fetch book status and populate the store", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      const mockStatus = {
        status: "currently_reading",
        rating: "4.5",
        currentPage: 42,
        currentPercent: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockStatus }),
      });

      const { result } = renderHook(() => useBookStatus("book-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/books/book-1/status"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );

      expect(result.current.status).toBe("currently_reading");
      expect(result.current.rating).toBe("4.5");
      expect(result.current.currentPage).toBe(42);
      expect(useBookStatusStore.getState().statuses["book-1"]).toEqual(
        mockStatus,
      );
    });

    it("should handle fetch failures gracefully", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: "Server error" } }),
      });

      const { result } = renderHook(() => useBookStatus("book-1"));

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      // Errors are swallowed — state stays null but we still hydrate
      expect(result.current.status).toBeNull();
      expect(result.current.rating).toBeNull();
      // The fetching set should be cleared even after errors
      expect(fetchingBooks.has("book-1")).toBe(false);
    });
  });

  describe("cache/dedup behavior", () => {
    it("should not trigger duplicate fetches for the same book across hook instances", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      const mockStatus = {
        status: "read" as const,
        rating: "5",
        currentPage: null,
        currentPercent: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockStatus }),
      });

      const { result: first } = renderHook(() => useBookStatus("book-1"));

      await waitFor(() => {
        expect(first.current.isHydrated).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second hook instance reads from the same cache — no extra fetch
      const { result: second } = renderHook(() => useBookStatus("book-1"));

      // Give any effect a tick to run
      await waitFor(() => {
        expect(second.current.isHydrated).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(second.current.status).toBe("read");
      expect(second.current.currentPercent).toBe(100);
    });

    it("should return the cached value from the store", async () => {
      // Pre-populate store to simulate a previous fetch
      useBookStatusStore.setState({
        statuses: {
          "book-xyz": {
            status: "want_to_read",
            rating: null,
            currentPage: null,
            currentPercent: null,
          },
        },
        hydrated: { "book-xyz": true },
      });

      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      const { result } = renderHook(() => useBookStatus("book-xyz"));

      expect(result.current.status).toBe("want_to_read");
      expect(result.current.isHydrated).toBe(true);
      // Already hydrated — should not fetch again
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("setStatus / clear", () => {
    it("should update the store when setStatus is called", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      // Prevent the effect-driven fetch from racing with our manual mutation
      useBookStatusStore.setState({
        hydrated: { "book-1": true },
      });

      const { result } = renderHook(() => useBookStatus("book-1"));

      act(() => {
        result.current.setStatus("currently_reading");
      });

      expect(useBookStatusStore.getState().statuses["book-1"]).toEqual({
        status: "currently_reading",
        rating: null,
        currentPage: null,
        currentPercent: null,
      });
    });

    it("should clear the cached status when clear is called", async () => {
      useBookStatusStore.setState({
        statuses: {
          "book-1": {
            status: "read",
            rating: "4",
            currentPage: 100,
            currentPercent: null,
          },
        },
        hydrated: { "book-1": true },
      });

      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      const { result } = renderHook(() => useBookStatus("book-1"));

      expect(result.current.status).toBe("read");

      act(() => {
        result.current.clear();
      });

      expect(useBookStatusStore.getState().statuses["book-1"]).toBeNull();
    });
  });
});
