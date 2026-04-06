"use client";

import { useState } from "react";
import { BookMarked, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface WantToReadButtonProps {
  bookId: string;
  initialWanted: boolean;
}

export const WantToReadButton = ({
  bookId,
  initialWanted,
}: WantToReadButtonProps) => {
  const session = useAuthStore((s) => s.session);
  const [wanted, setWanted] = useState(initialWanted);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(true);
    try {
      if (wanted) {
        await api.delete(`/v1/books/${bookId}/status`);
        setWanted(false);
      } else {
        await api.post(`/v1/books/${bookId}/status`, {
          status: "want_to_read",
        });
        setWanted(true);
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className={`w-full gap-2 font-semibold ${
        wanted
          ? "bg-secondary text-shelvitas-green hover:bg-secondary/80"
          : "bg-shelvitas-green text-background hover:bg-shelvitas-green/90"
      }`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {wanted ? (
        <>
          <Check className="h-4 w-4" />
          {isLoading ? "..." : "Want to Read"}
        </>
      ) : (
        <>
          <BookMarked className="h-4 w-4" />
          {isLoading ? "..." : "Want to Read"}
        </>
      )}
    </Button>
  );
};
