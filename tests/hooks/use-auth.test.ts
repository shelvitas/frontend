import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

// Track calls to supabase auth methods
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockSignOut = vi.fn();

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  }),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock fetch for api calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after mocks
const { useAuth } = await import("@/lib/hooks/use-auth");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  });
});

describe("useAuth", () => {
  describe("signInWithEmail", () => {
    it("should call supabase signInWithPassword and redirect to /profile", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithEmail("test@example.com", "password123");
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockPush).toHaveBeenCalledWith("/profile");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("should throw when supabase returns an error", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        error: new Error("Invalid login credentials"),
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signInWithEmail("bad@example.com", "wrong");
        }),
      ).rejects.toThrow("Invalid login credentials");
    });
  });

  describe("signUpWithEmail", () => {
    it("should call supabase signUp with email redirect", async () => {
      mockSignUp.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUpWithEmail("new@example.com", "password123");
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });

    it("should throw when supabase returns an error", async () => {
      mockSignUp.mockResolvedValueOnce({
        error: new Error("User already registered"),
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signUpWithEmail(
            "exists@example.com",
            "password123",
          );
        }),
      ).rejects.toThrow("User already registered");
    });
  });

  describe("signInWithGoogle", () => {
    it("should call supabase signInWithOAuth for Google", async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  describe("signInWithApple", () => {
    it("should call supabase signInWithOAuth for Apple", async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "apple",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  describe("resetPassword", () => {
    it("should call supabase resetPasswordForEmail with recovery redirect", async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword("test@example.com");
      });

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        {
          redirectTo: expect.stringContaining("/auth/callback?type=recovery"),
        },
      );
    });

    it("should throw when supabase returns an error", async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({
        error: new Error("Rate limit exceeded"),
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.resetPassword("test@example.com");
        }),
      ).rejects.toThrow("Rate limit exceeded");
    });
  });

  describe("updatePassword", () => {
    it("should call supabase updateUser with new password", async () => {
      mockUpdateUser.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updatePassword("newpassword123");
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: "newpassword123",
      });
    });

    it("should throw when supabase returns an error", async () => {
      mockUpdateUser.mockResolvedValueOnce({
        error: new Error("Password too weak"),
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.updatePassword("weak");
        }),
      ).rejects.toThrow("Password too weak");
    });
  });

  describe("registerProfile", () => {
    it("should call API, set profile in store, and redirect", async () => {
      const mockProfile = {
        id: "profile-123",
        email: "test@example.com",
        username: "newuser",
        displayName: "New User",
        bio: null,
        avatarUrl: null,
        profileVisibility: "public",
      };

      // Set session so api client includes auth header
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: mockProfile }),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.registerProfile("newuser", "New User", {
          favouriteBook1Id: "11111111-1111-1111-1111-111111111111",
          favouriteBook2Id: "22222222-2222-2222-2222-222222222222",
          favouriteBook3Id: "33333333-3333-3333-3333-333333333333",
          favouriteBook4Id: "44444444-4444-4444-4444-444444444444",
        });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/auth/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            username: "newuser",
            displayName: "New User",
            favouriteBook1Id: "11111111-1111-1111-1111-111111111111",
            favouriteBook2Id: "22222222-2222-2222-2222-222222222222",
            favouriteBook3Id: "33333333-3333-3333-3333-333333333333",
            favouriteBook4Id: "44444444-4444-4444-4444-444444444444",
          }),
        }),
      );
      expect(useAuthStore.getState().profile).toEqual(mockProfile);
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });
  });

  describe("signOut", () => {
    it("should sign out from supabase and clear store", async () => {
      // Set initial auth state
      useAuthStore.setState({
        user: { id: "123" } as never,
        session: { access_token: "token" } as never,
        profile: { id: "p1" } as never,
      });

      mockSignOut.mockResolvedValueOnce({ error: null });

      // Mock window.location
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        writable: true,
        value: { href: "" },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.profile).toBeNull();
      expect(window.location.href).toBe("/");

      // Restore
      Object.defineProperty(window, "location", {
        writable: true,
        value: originalLocation,
      });
    });
  });

  describe("fetchProfile", () => {
    it("should fetch profile from API and set in store", async () => {
      const mockProfile = {
        id: "profile-123",
        email: "test@example.com",
        username: "testuser",
        displayName: "Test User",
        bio: null,
        avatarUrl: null,
        profileVisibility: "public",
      };

      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockProfile }),
      });

      const { result } = renderHook(() => useAuth());

      let profile;
      await act(async () => {
        profile = await result.current.fetchProfile();
      });

      expect(profile).toEqual(mockProfile);
      expect(useAuthStore.getState().profile).toEqual(mockProfile);
    });

    it("should return null and not set profile when API call fails", async () => {
      useAuthStore.setState({
        session: { access_token: "test-token" } as never,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Unauthorized" } }),
      });

      const { result } = renderHook(() => useAuth());

      let profile;
      await act(async () => {
        profile = await result.current.fetchProfile();
      });

      expect(profile).toBeNull();
    });
  });

  describe("computed properties", () => {
    it("should return isAuthenticated based on session", () => {
      const { result, rerender } = renderHook(() => useAuth());
      expect(result.current.isAuthenticated).toBe(false);

      act(() => {
        useAuthStore.setState({
          session: { access_token: "token" } as never,
        });
      });
      rerender();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should return hasProfile based on profile", () => {
      const { result, rerender } = renderHook(() => useAuth());
      expect(result.current.hasProfile).toBe(false);

      act(() => {
        useAuthStore.setState({
          profile: { id: "p1", username: "test" } as never,
        });
      });
      rerender();
      expect(result.current.hasProfile).toBe(true);
    });
  });
});
