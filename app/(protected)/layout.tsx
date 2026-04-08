"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";
import { PageLoader } from "@/components/ui/page-loader";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !session) {
      window.location.href = "/sign-in";
    }
  }, [isLoading, session]);

  if (isLoading || !session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <PageLoader />
      </main>
    );
  }

  return children;
};

export default ProtectedLayout;
