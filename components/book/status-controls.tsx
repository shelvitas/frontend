"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookMarked,
  BookOpen,
  BookCheck,
  BookX,
  ChevronDown,
  X,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useBookStatus } from "@/lib/hooks/use-book-status";

type ReadingStatus =
  | "want_to_read"
  | "currently_reading"
  | "read"
  | "did_not_finish";

const statusConfig = {
  want_to_read: {
    label: "Want to Read",
    icon: BookMarked,
    color: "text-shelvitas-blue",
    bg: "bg-shelvitas-blue/10",
    border: "border-shelvitas-blue/30",
  },
  currently_reading: {
    label: "Reading",
    icon: BookOpen,
    color: "text-shelvitas-yellow",
    bg: "bg-shelvitas-yellow/10",
    border: "border-shelvitas-yellow/30",
  },
  read: {
    label: "Read",
    icon: BookCheck,
    color: "text-shelvitas-green",
    bg: "bg-shelvitas-green/10",
    border: "border-shelvitas-green/30",
  },
  did_not_finish: {
    label: "DNF",
    icon: BookX,
    color: "text-shelvitas-red",
    bg: "bg-shelvitas-red/10",
    border: "border-shelvitas-red/30",
  },
} as const;

const allStatuses: ReadingStatus[] = [
  "want_to_read",
  "currently_reading",
  "read",
  "did_not_finish",
];

const dnfReasons = [
  { value: "boring", label: "Too boring" },
  { value: "too_dense", label: "Too dense / hard to follow" },
  { value: "wrong_mood", label: "Wrong mood / wrong time" },
  { value: "life", label: "Life got in the way" },
  { value: "not_for_me", label: "Just not for me" },
] as const;

interface StatusControlsProps {
  bookId: string;
}

export const StatusControls = ({ bookId }: StatusControlsProps) => {
  const { toast } = useToast();
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
  const [open, setOpen] = useState(false);
  const [dnfOpen, setDnfOpen] = useState(false);
  const [dnfReason, setDnfReason] = useState<string>("not_for_me");
  const [dnfPage, setDnfPage] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!isAuthenticated) return null;

  if (!isHydrated) {
    return (
      <div className="h-9 w-40 animate-pulse rounded-sm bg-secondary/50" />
    );
  }

  const handleSelect = async (status: ReadingStatus) => {
    setOpen(false);
    if (loadingStatus) return;

    if (status === "did_not_finish") {
      setDnfReason("not_for_me");
      setDnfPage("");
      setDnfOpen(true);
      return;
    }

    const prev = activeStatus;
    setStatus(status);
    setLoadingStatus(status);

    try {
      await api.post(`/v1/books/${bookId}/status`, { status });
      toast(`Marked as ${statusConfig[status].label}`);
    } catch {
      if (prev) setStatus(prev);
      else clear();
      toast("Failed to update status", "error");
    } finally {
      setLoadingStatus(null);
    }
  };

  const handleDnfSubmit = async () => {
    const prev = activeStatus;
    setStatus("did_not_finish");
    setLoadingStatus("did_not_finish");
    setDnfOpen(false);

    try {
      await api.post(`/v1/books/${bookId}/dnf`, {
        reason: dnfReason,
        ...(dnfPage && { pageStopped: parseInt(dnfPage, 10) }),
      });
      toast("Marked as Did Not Finish");
    } catch {
      if (prev) setStatus(prev);
      else clear();
      toast("Failed to update status", "error");
    } finally {
      setLoadingStatus(null);
    }
  };

  const handleRemove = async () => {
    if (loadingStatus) return;
    const prev = activeStatus;
    clear();
    setLoadingStatus(prev as ReadingStatus);
    try {
      await api.delete(`/v1/books/${bookId}/status`);
      toast("Status removed");
    } catch {
      if (prev) setStatus(prev);
      toast("Failed to remove status", "error");
    } finally {
      setLoadingStatus(null);
    }
  };

  const active = activeStatus
    ? statusConfig[activeStatus as ReadingStatus]
    : null;
  const ActiveIcon = active?.icon;
  const isLoading = !!loadingStatus;

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-xs font-medium transition-all ${
          active
            ? `${active.bg} ${active.border} ${active.color}`
            : "border-shelvitas-green bg-shelvitas-green text-background hover:bg-shelvitas-green/90"
        }`}
      >
        {isLoading && <Spinner className="h-3.5 w-3.5" />}
        {!isLoading && ActiveIcon && <ActiveIcon className="h-3.5 w-3.5" />}
        {!isLoading && !ActiveIcon && <BookMarked className="h-3.5 w-3.5" />}
        {active ? active.label : "Add to your books"}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />

        {/* Remove button */}
        {active && !isLoading && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                handleRemove();
              }
            }}
            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-sm border border-secondary bg-background py-1 shadow-lg">
          {allStatuses.map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleSelect(status)}
                className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-secondary/30 ${
                  isActive
                    ? `font-semibold ${config.color}`
                    : "text-foreground/80"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? config.color : "text-muted-foreground"}`}
                />
                {config.label}
                {isActive && (
                  <span className="ml-auto text-[9px] text-muted-foreground">
                    current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* DNF Modal */}
      <Dialog open={dnfOpen} onOpenChange={setDnfOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-shelvitas-red">
              <BookX className="h-4 w-4" />
              Did Not Finish
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Why did you stop?
              </p>
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <div className="space-y-2.5">
                {dnfReasons.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="radio"
                      name="dnf-reason"
                      value={r.value}
                      checked={dnfReason === r.value}
                      onChange={() => setDnfReason(r.value)}
                      className="h-4 w-4 accent-shelvitas-red"
                    />
                    <span className={dnfReason === r.value ? "font-medium text-shelvitas-red" : "text-foreground/70"}>
                      {r.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Page stopped at (optional)
              </p>
              <input
                type="number"
                value={dnfPage}
                onChange={(e) => setDnfPage(e.target.value)}
                placeholder="e.g. 85"
                min={0}
                className="w-full rounded-sm border border-secondary bg-secondary/30 px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setDnfOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-1.5 bg-shelvitas-red text-background hover:bg-shelvitas-red/90"
                onClick={handleDnfSubmit}
                disabled={!!loadingStatus}
              >
                {loadingStatus === "did_not_finish" && (
                  <Spinner className="h-3 w-3" />
                )}
                Mark as DNF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
