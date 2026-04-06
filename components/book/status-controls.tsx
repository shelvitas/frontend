"use client";

import { useState } from "react";
import { BookMarked, BookOpen, BookCheck, BookX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useBookStatus } from "@/lib/hooks/use-book-status";

type ReadingStatus =
  | "want_to_read"
  | "currently_reading"
  | "read"
  | "did_not_finish";

interface StatusControlsProps {
  bookId: string;
}

const statusConfig = {
  want_to_read: {
    label: "Want to Read",
    icon: BookMarked,
    color: "text-shelvitas-blue",
  },
  currently_reading: {
    label: "Reading",
    icon: BookOpen,
    color: "text-shelvitas-green",
  },
  read: { label: "Read", icon: BookCheck, color: "text-shelvitas-green" },
  did_not_finish: {
    label: "DNF",
    icon: BookX,
    color: "text-shelvitas-orange",
  },
} as const;

// want_to_read is handled by WantToReadButton — no duplicate here
const statuses: ReadingStatus[] = [
  "currently_reading",
  "read",
  "did_not_finish",
];

export const StatusControls = ({ bookId }: StatusControlsProps) => {
  const {
    status: activeStatus,
    isHydrated,
    isAuthenticated,
    setStatus,
    clear,
  } = useBookStatus(bookId);
  const [loadingStatus, setLoadingStatus] = useState<ReadingStatus | null>(
    null,
  );

  if (!isAuthenticated) {
    return null; // WantToReadButton handles the unauthenticated CTA
  }

  // Skeleton while hydrating
  if (!isHydrated) {
    return (
      <div className="flex gap-2">
        {statuses.map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            className="flex-1 text-xs opacity-50"
            disabled
          >
            <Spinner className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
    );
  }

  const handleStatusChange = async (status: ReadingStatus) => {
    if (loadingStatus) return;

    const prev = activeStatus;
    const isToggleOff = status === activeStatus;

    if (isToggleOff) {
      clear();
    } else {
      setStatus(status);
    }
    setLoadingStatus(status);

    try {
      if (isToggleOff) {
        await api.delete(`/v1/books/${bookId}/status`);
      } else if (status === "did_not_finish") {
        await api.post(`/v1/books/${bookId}/dnf`, { reason: "not_for_me" });
      } else {
        await api.post(`/v1/books/${bookId}/status`, { status });
      }
    } catch {
      if (prev) setStatus(prev);
      else clear();
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="flex gap-2">
      {statuses.map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isActive = activeStatus === status;
        const isThisLoading = loadingStatus === status;

        return (
          <Button
            key={status}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`flex-1 gap-1.5 text-xs transition-all ${
              isActive ? `${config.color} border-secondary bg-secondary` : ""
            }`}
            onClick={() => handleStatusChange(status)}
            disabled={!!loadingStatus}
          >
            {isThisLoading ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            {config.label}
          </Button>
        );
      })}
    </div>
  );
};
