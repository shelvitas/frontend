import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SERVER_API_URL", () => {
  it("uses INTERNAL_API_URL when set", async () => {
    vi.stubEnv("INTERNAL_API_URL", "http://api:4000");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000");
    vi.stubEnv("HOSTNAME", "");

    const { SERVER_API_URL } = await import("@/lib/server-fetch");
    expect(SERVER_API_URL).toBe("http://api:4000");
  });

  it("uses NEXT_PUBLIC_API_URL when no Docker hostname", async () => {
    vi.stubEnv("INTERNAL_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000");
    vi.stubEnv("HOSTNAME", "");

    const { SERVER_API_URL } = await import("@/lib/server-fetch");
    expect(SERVER_API_URL).toBe("http://localhost:4000");
  });

  it("falls back to http://localhost:4000 when no env vars set", async () => {
    vi.stubEnv("INTERNAL_API_URL", "");
    // Force NEXT_PUBLIC_API_URL to be undefined so the ?? fallback triggers
    const original = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    vi.stubEnv("HOSTNAME", "");

    try {
      const { SERVER_API_URL } = await import("@/lib/server-fetch");
      expect(SERVER_API_URL).toBe("http://localhost:4000");
    } finally {
      if (original !== undefined) process.env.NEXT_PUBLIC_API_URL = original;
    }
  });

  it("replaces localhost with 'api' when running in Docker", async () => {
    vi.stubEnv("INTERNAL_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000");
    vi.stubEnv("HOSTNAME", "docker-frontend-1");

    const { SERVER_API_URL } = await import("@/lib/server-fetch");
    expect(SERVER_API_URL).toBe("http://api:4000");
  });

  it("replaces 127.0.0.1 with 'api' when running in Docker", async () => {
    vi.stubEnv("INTERNAL_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:4000");
    vi.stubEnv("HOSTNAME", "docker-frontend-1");

    const { SERVER_API_URL } = await import("@/lib/server-fetch");
    expect(SERVER_API_URL).toBe("http://api:4000");
  });

  it("prefers INTERNAL_API_URL over Docker hostname detection", async () => {
    vi.stubEnv("INTERNAL_API_URL", "http://custom-api:5000");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000");
    vi.stubEnv("HOSTNAME", "docker-frontend-1");

    const { SERVER_API_URL } = await import("@/lib/server-fetch");
    expect(SERVER_API_URL).toBe("http://custom-api:5000");
  });
});

describe("serverFetch", () => {
  beforeEach(() => {
    vi.stubEnv("INTERNAL_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000");
    vi.stubEnv("HOSTNAME", "");
  });

  it("returns parsed JSON data on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: "book-1", title: "Dune" } }),
    });

    const { serverFetch } = await import("@/lib/server-fetch");
    const result = await serverFetch<{ id: string; title: string }>(
      "/v1/books/book-1",
    );

    expect(result).toEqual({ id: "book-1", title: "Dune" });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4000/v1/books/book-1",
      expect.objectContaining({
        cache: "no-store",
        signal: expect.any(Object),
      }),
    );
  });

  it("returns null when response has no 'data' field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { serverFetch } = await import("@/lib/server-fetch");
    const result = await serverFetch("/v1/empty");

    expect(result).toBeNull();
  });

  it("returns null on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { serverFetch } = await import("@/lib/server-fetch");
    const result = await serverFetch("/v1/missing");

    expect(result).toBeNull();
  });

  it("returns null on fetch failure (network error)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { serverFetch } = await import("@/lib/server-fetch");
    const result = await serverFetch("/v1/test");

    expect(result).toBeNull();
  });

  it("returns null on JSON parse error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    const { serverFetch } = await import("@/lib/server-fetch");
    const result = await serverFetch("/v1/test");

    expect(result).toBeNull();
  });

  it("uses SERVER_API_URL as base when building URL", async () => {
    vi.stubEnv("INTERNAL_API_URL", "http://api:4000");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: "ok" }),
    });

    const { serverFetch } = await import("@/lib/server-fetch");
    await serverFetch("/v1/health");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://api:4000/v1/health",
      expect.any(Object),
    );
  });

  it("passes an AbortSignal on the fetch call", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: "ok" }),
    });

    const { serverFetch } = await import("@/lib/server-fetch");
    await serverFetch("/v1/test");

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.signal).toBeDefined();
    expect(opts.signal.aborted).toBe(false);
  });

  it("returns null when the AbortController fires (timeout)", async () => {
    // Simulate a fetch that rejects with an abort-style error
    mockFetch.mockImplementationOnce(
      (_url, opts) =>
        new Promise((_resolve, reject) => {
          opts.signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted.");
            err.name = "AbortError";
            reject(err);
          });
        }),
    );

    vi.useFakeTimers();
    const { serverFetch } = await import("@/lib/server-fetch");
    const resultPromise = serverFetch("/v1/slow");
    vi.advanceTimersByTime(5001);
    const result = await resultPromise;

    expect(result).toBeNull();
  });
});
