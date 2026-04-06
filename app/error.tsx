"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
      <p className="text-5xl font-bold text-muted-foreground/30">Oops</p>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        This page failed to load. The server might be restarting — try again in
        a moment.
      </p>
      <div className="mt-2 flex gap-2">
        <Button
          onClick={reset}
          className="bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
        >
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  );
};

export default GlobalError;
