"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";

const AuthCallbackPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Supabase client automatically picks up tokens from the URL fragment
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        setStatus("Authentication failed. Redirecting...");
        router.push("/sign-in?error=auth_callback_failed");
        return;
      }

      // Check if user has an app profile
      try {
        await api.get("/v1/auth/me");
        // Profile exists — go to feed
        router.push("/profile");
      } catch {
        // No profile — new user needs to complete registration
        router.push("/complete-profile");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">{status}</p>
    </main>
  );
};

export default AuthCallbackPage;
