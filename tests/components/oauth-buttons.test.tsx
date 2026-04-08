import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const mockSignInWithOAuth = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/ui/toaster", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const { OAuthButtons } = await import("@/components/auth/oauth-buttons");

beforeEach(() => {
  vi.clearAllMocks();
  mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  });

  // jsdom needs a well-defined window.location.origin for redirectTo
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: "", origin: "http://localhost:3000" },
  });
});

describe("OAuthButtons", () => {
  it("should render the Google sign-in button", () => {
    render(<OAuthButtons />);

    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("should call signInWithOAuth with the google provider when clicked", async () => {
    render(<OAuthButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    });

    const [args] = mockSignInWithOAuth.mock.calls[0];
    expect(args.provider).toBe("google");
  });

  it("should pass a redirectTo URL pointing at /auth/callback", async () => {
    render(<OAuthButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalled();
    });

    const [args] = mockSignInWithOAuth.mock.calls[0];
    expect(args.options.redirectTo).toBe(
      "http://localhost:3000/auth/callback",
    );
  });

  it("should show a loading indicator and disable the button while connecting", async () => {
    // Hold the promise open so we can observe the in-flight state
    let resolveOAuth: (value: unknown) => void = () => {};
    mockSignInWithOAuth.mockReturnValue(
      new Promise((resolve) => {
        resolveOAuth = resolve;
      }),
    );

    render(<OAuthButtons />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /connecting/i }),
      ).toBeDisabled();
    });

    // Clean up the dangling promise so tests don't leak
    resolveOAuth({ data: {}, error: null });
  });

  it("should re-enable the button after signInWithOAuth throws", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: {},
      error: new Error("OAuth failed"),
    });

    render(<OAuthButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /continue with google/i }),
      ).not.toBeDisabled();
    });
  });

  it("should NOT call fetch directly — OAuth goes through supabase", async () => {
    render(<OAuthButtons />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalled();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
