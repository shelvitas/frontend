"use client";

import { useState } from "react";
import { BookMarked, BookOpen, BookCheck, BookX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { UserBookStatus } from "@/lib/types";

type ReadingStatus = "want_to_read" | "currently_reading" | "read" | "did_not_finish";

interface StatusControlsProps {
  bookId: string;
  initialStatus: UserBookStatus | null;
}

const statusConfig = {
  want_to_read: { label: "Want to Read", icon: BookMarked, color: "text-shelvitas-blue" },
  currently_reading: { label: "Reading", icon: BookOpen, color: "text-shelvitas-green" },
  read: { label: "Read", icon: BookCheck, color: "text-shelvitas-green" },
  did_not_finish: { label: "DNF", icon: BookX, color: "text-shelvitas-orange" },
} as const;

export const StatusControls = ({ bookId, initialStatus }: StatusControlsProps) => {
  const session = useAuthStore((s) => s.session);
  const [activeStatus, setActiveStatus] = useState<ReadingStatus | null>(
    initialStatus?.status ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return (
      <Button
        className="w-full bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
        onClick={() => {
          window.location.href = "/sign-in";
        }}
      >
        <BookMarked className="mr-2 h-4 w-4" />
        Want to Read
      </Button>
    );
  }

  const handleStatusChange = async (status: ReadingStatus) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (status === activeStatus) {
        // Toggle off — remove status
        await api.delete(`/v1/books/${bookId}/status`);
        setActiveStatus(null);
      } else if (status === "did_not_finish") {
        await api.post(`/v1/books/${bookId}/dnf`, { reason: "not_for_me" });
        setActiveStatus("did_not_finish");
      } else {
        await api.post(`/v1/books/${bookId}/status`, { status });
        setActiveStatus(status);
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  const statuses: ReadingStatus[] = ["want_to_read", "currently_reading", "read", "did_not_finish"];

  return (
    <div className="flex gap-2">
      {statuses.map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isActive = activeStatus === status;

        return (
          <Button
            key={status}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`flex-1 gap-1.5 text-xs ${
              isActive ? `${config.color} bg-secondary border-secondary` : ""
            }`}
            onClick={() => handleStatusChange(status)}
            disabled={isLoading}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
};
