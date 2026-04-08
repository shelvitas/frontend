import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server BEFORE importing the module under test.
// We supply a minimal NextResponse with `next` and `redirect` so the
// middleware can exercise both branches without pulling in the full
// Next runtime.
const nextMock = vi.fn(() => ({ type: "next" }));
const redirectMock = vi.fn((url: URL) => ({ type: "redirect", url }));

vi.mock("next/server", () => ({
  NextResponse: {
    next: nextMock,
    redirect: redirectMock,
  },
}));

const { updateSession } = await import("@/lib/supabase/middleware");

/**
 * Build a minimal fake NextRequest that exposes just what `updateSession`
 * touches: `nextUrl.pathname`, `nextUrl.clone()`, and `cookies.getAll()`.
 */
function makeRequest(
  pathname: string,
  cookies: Array<{ name: string; value: string }> = [],
) {
  const nextUrl = {
    pathname,
    clone() {
      return { pathname: this.pathname };
    },
  };
  return {
    nextUrl,
    cookies: {
      getAll: () => cookies,
    },
  } as never;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateSession middleware", () => {
  it("returns NextResponse.next() for non-auth routes", async () => {
    const req = makeRequest("/profile");
    const result = await updateSession(req);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({ type: "next" });
  });

  it("returns NextResponse.next() for the home route", async () => {
    const req = makeRequest("/");
    await updateSession(req);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("allows unauthenticated users to access /sign-in", async () => {
    const req = makeRequest("/sign-in");
    const result = await updateSession(req);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({ type: "next" });
  });

  it("allows unauthenticated users to access /sign-up", async () => {
    const req = makeRequest("/sign-up");
    await updateSession(req);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects authenticated users away from /sign-in to /profile", async () => {
    const req = makeRequest("/sign-in", [
      { name: "sb-abc123-auth-token", value: "jwt" },
    ]);
    await updateSession(req);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(nextMock).not.toHaveBeenCalled();
    const redirectedUrl = redirectMock.mock.calls[0][0] as unknown as {
      pathname: string;
    };
    expect(redirectedUrl.pathname).toBe("/profile");
  });

  it("redirects authenticated users away from /sign-up to /profile", async () => {
    const req = makeRequest("/sign-up", [
      { name: "sb-xyz-auth-token", value: "jwt" },
    ]);
    await updateSession(req);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    const redirectedUrl = redirectMock.mock.calls[0][0] as unknown as {
      pathname: string;
    };
    expect(redirectedUrl.pathname).toBe("/profile");
  });

  it("does not redirect for non-auth cookies that start with 'sb-'", async () => {
    // Cookie must end with '-auth-token' to count as an auth cookie
    const req = makeRequest("/sign-in", [
      { name: "sb-preferences", value: "foo" },
    ]);
    await updateSession(req);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("does not redirect for cookies ending in '-auth-token' but not starting with 'sb-'", async () => {
    const req = makeRequest("/sign-in", [
      { name: "other-auth-token", value: "jwt" },
    ]);
    await updateSession(req);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("passes through with auth cookie present on non-auth routes", async () => {
    const req = makeRequest("/books/abc", [
      { name: "sb-abc-auth-token", value: "jwt" },
    ]);
    await updateSession(req);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("treats sub-routes of /sign-in as auth routes", async () => {
    const req = makeRequest("/sign-in/oauth", [
      { name: "sb-abc-auth-token", value: "jwt" },
    ]);
    await updateSession(req);

    expect(redirectMock).toHaveBeenCalledTimes(1);
  });
});
