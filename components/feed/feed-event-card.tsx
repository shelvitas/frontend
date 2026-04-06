"use client";

import Link from "next/link";
import {
  Star,
  BookOpen,
  BookCheck,
  BookMarked,
  BookX,
  List,
  MessageCircle,
} from "lucide-react";

import type { FeedEvent } from "@/lib/types";
import { RemoteImage } from "@/components/ui/remote-image";

const eventLabels: Record<string, string> = {
  status_update: "updated status",
  rating: "rated",
  review: "reviewed",
  progress_update: "is reading",
  list_created: "created a list",
  list_updated: "updated a list",
};

const statusIcons: Record<string, typeof BookOpen> = {
  want_to_read: BookMarked,
  currently_reading: BookOpen,
  read: BookCheck,
  did_not_finish: BookX,
};

function getStatusLabel(metadata: Record<string, unknown> | null): string {
  const status = metadata?.status as string | undefined;
  const labels: Record<string, string> = {
    want_to_read: "wants to read",
    currently_reading: "started reading",
    read: "finished reading",
    did_not_finish: "did not finish",
  };
  return labels[status ?? ""] ?? "updated status on";
}

export const FeedEventCard = ({ event }: { event: FeedEvent }) => {
  const metadata = (event.metadata ?? {}) as Record<
    string,
    string | number | boolean | null
  >;
  const { book } = event;
  const StatusIcon =
    event.eventType === "status_update"
      ? (statusIcons[(metadata.status as string) ?? ""] ?? BookOpen)
      : null;

  // Determine display text
  let actionText = eventLabels[event.eventType] ?? "interacted with";
  if (event.eventType === "status_update") {
    actionText = getStatusLabel(event.metadata);
  }

  const rating = metadata.rating as number | undefined;

  return (
    <div className="flex gap-4 rounded-sm border border-secondary p-4">
      {/* Book cover */}
      {book?.coverUrl && (
        <Link href={`/books/${book.id}`} className="shrink-0">
          <RemoteImage
            src={book.coverUrl}
            alt={book.title}
            width={56}
            height={80}
            className="h-20 w-14 rounded-sm object-cover transition-opacity hover:opacity-80"
          />
        </Link>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* User + action */}
        <div className="flex items-center gap-2">
          {event.user && (
            <>
              {event.user.avatarUrl ? (
                <RemoteImage
                  src={event.user.avatarUrl}
                  alt={event.user.displayName}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                  {event.user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <Link
                href={`/${event.user.username}`}
                className="text-sm font-medium hover:text-shelvitas-green"
              >
                {event.user.displayName}
              </Link>
            </>
          )}
          <span className="text-xs text-muted-foreground">{actionText}</span>
          {StatusIcon && (
            <StatusIcon className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Book title */}
        {book !== null && (
          <Link
            href={`/books/${book.id}`}
            className="mt-1 block text-sm font-medium hover:text-shelvitas-green"
          >
            {book.title}
          </Link>
        )}

        {/* Rating */}
        {rating && (
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`feed-star-${event.id}-${i + 1}`}
                className={`h-3 w-3 ${
                  i < Math.round(rating)
                    ? "fill-shelvitas-orange text-shelvitas-orange"
                    : "text-secondary"
                }`}
              />
            ))}
          </div>
        )}

        {/* Progress milestone */}
        {event.eventType === "progress_update" && metadata.milestone && (
          <p className="mt-1 text-xs text-shelvitas-green">
            {String(metadata.milestone)}% complete
          </p>
        )}

        {/* Review link */}
        {event.reviewId && (
          <Link
            href={`/reviews/${event.reviewId}`}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-3 w-3" />
            Read review
          </Link>
        )}

        {/* List link */}
        {event.listId && (
          <Link
            href={`/lists/${event.listId}`}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <List className="h-3 w-3" />
            View list
          </Link>
        )}

        {/* Timestamp */}
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {new Date(event.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
