"use client";

import Link from "next/link";
import { Star, Pencil, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DiaryEntry } from "@/lib/types";
import { RemoteImage } from "@/components/ui/remote-image";

const formatLabels: Record<string, string> = {
  physical: "Physical",
  ebook: "eBook",
  audiobook: "Audiobook",
  borrowed: "Borrowed",
};

const statusLabels: Record<string, string> = {
  want_to_read: "Want to Read",
  currently_reading: "Reading",
  read: "Read",
  did_not_finish: "DNF",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onEdit?: (entry: DiaryEntry) => void;
}

export const DiaryEntryCard = ({ entry, onEdit }: DiaryEntryCardProps) => {
  const rating = entry.rating ? parseFloat(entry.rating) : null;

  return (
    <div className="flex gap-4 rounded-sm border border-secondary p-4">
      {/* Cover thumbnail */}
      <Link
        href={`/books/${entry.book.slug ?? entry.book.id}`}
        className="shrink-0"
      >
        {entry.book.coverUrl ? (
          <RemoteImage
            src={entry.book.coverUrl}
            alt={entry.book.title}
            width={64}
            height={96}
            className="h-24 w-16 rounded-sm object-cover transition-opacity hover:opacity-80"
          />
        ) : (
          <div className="flex h-24 w-16 items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
            No cover
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title + badges */}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/books/${entry.book.slug ?? entry.book.id}`}
              className="text-sm font-medium hover:text-shelvitas-green"
            >
              {entry.book.title}
            </Link>

            {/* Badges */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {entry.isReread && (
                <span className="inline-flex items-center gap-0.5 rounded-sm bg-shelvitas-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-shelvitas-blue">
                  <RefreshCw className="h-2.5 w-2.5" />
                  Reread
                </span>
              )}
              <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {statusLabels[entry.status] ?? entry.status}
              </span>
              {entry.format && (
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {formatLabels[entry.format] ?? entry.format}
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(entry)}
              aria-label="Edit entry"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Rating */}
        {rating !== null && (
          <div className="mt-1.5 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`diary-star-${entry.id}-${i + 1}`}
                className={`h-3 w-3 ${
                  i < Math.round(rating)
                    ? "fill-shelvitas-orange text-shelvitas-orange"
                    : "text-secondary"
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="mt-1.5 text-xs text-muted-foreground">
          {entry.startedAt && entry.finishedAt && (
            <span>
              {formatDate(entry.startedAt)} — {formatDate(entry.finishedAt)}
            </span>
          )}
          {entry.startedAt && !entry.finishedAt && (
            <span>Started {formatDate(entry.startedAt)}</span>
          )}
          {!entry.startedAt && entry.finishedAt && (
            <span>Finished {formatDate(entry.finishedAt)}</span>
          )}
        </div>

        {/* Review snippet */}
        {entry.privateNotes && (
          <p className="mt-2 line-clamp-2 text-xs text-foreground/70">
            {entry.privateNotes}
          </p>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
