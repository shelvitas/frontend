"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="text-5xl font-bold text-muted-foreground/30">Oops</p>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        className="mt-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
      >
        Try again
      </Button>
    </div>
  );
};

export default GlobalError;
