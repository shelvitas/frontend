"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/ui/page-loader";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const AuthCallbackPage = () => {
  const [, setStatus] = useState("Completing sign in...");
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        setStatus("Authentication failed. Redirecting...");
        window.location.href = "/sign-in?error=auth_callback_failed";
        return;
      }

      // Store session in zustand so api helper can use it
      setAuth(session.user, session);

      // Check if user has an app profile
      try {
        const res = await fetch(`${API_URL}/v1/auth/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          window.location.href = "/profile";
        } else {
          window.location.href = "/complete-profile";
        }
      } catch {
        window.location.href = "/complete-profile";
      }
    };

    handleCallback();
  }, [setAuth]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <PageLoader />
    </main>
  );
};

export default AuthCallbackPage;
