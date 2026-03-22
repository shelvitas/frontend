"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async () => {
      try {
        const profile = await api.get<Parameters<typeof setProfile>[0]>(
          "/v1/auth/me",
        );
        setProfile(profile);
      } catch {
        setProfile(null);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
      if (session) loadProfile();
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuth(session?.user ?? null, session);

      if (event === "SIGNED_IN" && session) {
        await loadProfile();
      }

      if (event === "SIGNED_OUT") {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, setProfile, setLoading]);

  return children;
};
