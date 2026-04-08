"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export const useAuth = () => {
  const router = useRouter();
  const { user, session, profile, isLoading, setAuth, setProfile, clear } =
    useAuthStore();
  const supabase = createClient();

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/profile");
      router.refresh();
    },
    [supabase, router],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }, [supabase]);

  const signInWithApple = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
    [supabase],
  );

  const registerProfile = useCallback(
    async (
      username: string,
      displayName: string,
      favourites: {
        favouriteBook1Id: string;
        favouriteBook2Id: string;
        favouriteBook3Id: string;
        favouriteBook4Id: string;
      },
    ) => {
      const newProfile = await api.post<{
        id: string;
        email: string;
        username: string;
        displayName: string;
        bio: string | null;
        avatarUrl: string | null;
        profileVisibility: "public" | "private";
      }>("/v1/auth/register", {
        username,
        displayName,
        ...favourites,
      });
      setProfile(newProfile);
      router.push("/profile");
      router.refresh();
      return newProfile;
    },
    [setProfile, router],
  );

  const signOut = useCallback(async () => {
    // Sign out from Supabase (clears client session)
    await supabase.auth.signOut();
    clear();
    window.location.href = "/";
  }, [supabase, clear]);

  const fetchProfile = useCallback(async () => {
    try {
      const fetchedProfile = await api.get<{
        id: string;
        email: string;
        username: string;
        displayName: string;
        bio: string | null;
        avatarUrl: string | null;
        profileVisibility: "public" | "private";
      }>("/v1/auth/me");
      setProfile(fetchedProfile);
      return fetchedProfile;
    } catch {
      return null;
    }
  }, [setProfile]);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!session,
    hasProfile: !!profile,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    updatePassword,
    registerProfile,
    signOut,
    fetchProfile,
    setAuth,
    setProfile,
  };
};
