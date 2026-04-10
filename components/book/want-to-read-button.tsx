"use client";

import { useState } from "react";
import { BookMarked, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useBookStatus } from "@/lib/hooks/use-book-status";

interface WantToReadButtonProps {
  bookId: string;
}

export const WantToReadButton = ({ bookId }: WantToReadButtonProps) => {
  const { toast } = useToast();
  const { status, isHydrated, isAuthenticated, setStatus, clear } =
    useBookStatus(bookId);
  const [isLoading, setIsLoading] = useState(false);

  const wanted = status === "want_to_read";
  const hasOtherStatus = status !== null && !wanted;

  const handleClick = async () => {
    if (!isAuthenticated) {
      window.location.href = "/sign-in";
      return;
    }

    const prev = status;
    if (wanted) {
      clear();
    } else {
      setStatus("want_to_read");
    }
    setIsLoading(true);

    try {
      if (wanted) {
        await api.delete(`/v1/books/${bookId}/status`);
        toast("Removed from reading list");
      } else {
        await api.post(`/v1/books/${bookId}/status`, {
          status: "want_to_read",
        });
        toast("Added to reading list");
      }
    } catch {
      if (prev) setStatus(prev);
      else clear();
      toast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton while hydrating auth state
  if (!isHydrated && isAuthenticated) {
    return (
      <Button
        size="lg"
        className="w-full gap-2 bg-secondary font-semibold text-muted-foreground"
        disabled
      >
        <Spinner />
      </Button>
    );
  }

  // Already has a different status (reading, read, DNF) — hide this CTA
  if (hasOtherStatus) return null;

  return (
    <Button
      size="lg"
      className={`w-full gap-2 font-semibold transition-all ${
        wanted
          ? "bg-secondary text-shelvitas-blue hover:bg-secondary/80"
          : "bg-shelvitas-blue text-background hover:bg-shelvitas-blue/90"
      }`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading && <Spinner />}
      {!isLoading && wanted && <Check className="h-4 w-4" />}
      {!isLoading && !wanted && <BookMarked className="h-4 w-4" />}
      {wanted ? "Added to Reading List" : "Want to Read"}
    </Button>
  );
};
