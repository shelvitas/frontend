import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
      }),
    },
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after mocks are set up
const { api } = await import("@/lib/api");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("api client", () => {
  describe("get", () => {
    it("should make GET request and return data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { id: "123", name: "Test" } }),
      });

      const result = await api.get("/v1/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:4000/v1/test",
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      expect(result).toEqual({ id: "123", name: "Test" });
    });

    it("should throw on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: { message: "Not found" },
          }),
      });

      await expect(api.get("/v1/missing")).rejects.toThrow("Not found");
    });
  });

  describe("post", () => {
    it("should make POST request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: { id: "456" } }),
      });

      const result = await api.post("/v1/test", { name: "New" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:4000/v1/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "New" }),
        }),
      );
      expect(result).toEqual({ id: "456" });
    });
  });

  describe("delete", () => {
    it("should handle 204 no content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await api.delete("/v1/test/123");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:4000/v1/test/123",
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(result).toBeUndefined();
    });
  });

  describe("patch", () => {
    it("should make PATCH request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { id: "789", name: "Updated" } }),
      });

      const result = await api.patch("/v1/test/789", { name: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:4000/v1/test/789",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "Updated" }),
        }),
      );
      expect(result).toEqual({ id: "789", name: "Updated" });
    });
  });

  describe("auth headers", () => {
    it("should not include auth header when no session", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await api.get("/v1/test");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBeUndefined();
    });

    it("should include auth header when session exists in store", async () => {
      // Set session in the auth store
      const { useAuthStore } = await import("@/store/auth");
      useAuthStore.setState({
        session: { access_token: "test-jwt-token" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await api.get("/v1/test");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBe("Bearer test-jwt-token");

      // Clean up
      useAuthStore.setState({ session: null });
    });
  });

  describe("content-type", () => {
    it("should set Content-Type when body is provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: { id: "1" } }),
      });

      await api.post("/v1/test", { name: "Test" });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Content-Type"]).toBe("application/json");
    });

    it("should NOT set Content-Type when no body (avoids Fastify empty JSON error)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: { id: "1" } }),
      });

      await api.post("/v1/test");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Content-Type"]).toBeUndefined();
    });

    it("should NOT set Content-Type on DELETE requests", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.delete("/v1/test/1");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Content-Type"]).toBeUndefined();
    });

    it("should NOT set Content-Type on GET requests", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await api.get("/v1/test");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Content-Type"]).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should throw with error message from response body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: { message: "Bad request" },
          }),
      });

      await expect(api.post("/v1/test", {})).rejects.toThrow("Bad request");
    });

    it("should throw with status code when no error message in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(api.get("/v1/test")).rejects.toThrow("Request failed: 500");
    });
  });
});
