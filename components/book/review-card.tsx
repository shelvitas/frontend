import Link from "next/link";
import { Star, ThumbsUp, MessageCircle, AlertTriangle } from "lucide-react";

import type { BookReview } from "@/lib/types";

export const ReviewCard = ({ review }: { review: BookReview }) => (
  <div className="rounded-sm border border-secondary p-4">
    {/* Reviewer info */}
    <div className="flex items-center gap-2">
      {review.reviewer.avatarUrl ? (
        <img
          src={review.reviewer.avatarUrl}
          alt={review.reviewer.displayName}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          {review.reviewer.displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <Link
          href={`/${review.reviewer.username}`}
          className="text-sm font-medium hover:text-shelvitas-green"
        >
          {review.reviewer.displayName}
        </Link>
        {review.rating && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`review-star-${review.id}-${i + 1}`}
                className={`h-3 w-3 ${
                  i < Math.round(review.rating!)
                    ? "fill-shelvitas-orange text-shelvitas-orange"
                    : "text-secondary"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {review.isDnf && (
        <span className="ml-auto rounded-sm bg-shelvitas-orange/10 px-2 py-0.5 text-[10px] font-medium text-shelvitas-orange">
          DNF
        </span>
      )}
    </div>

    {/* Body */}
    {review.containsSpoilers ? (
      <div className="mt-3 flex items-center gap-2 rounded-sm bg-secondary/50 p-3 text-xs text-muted-foreground">
        <AlertTriangle className="h-4 w-4 text-shelvitas-orange" />
        This review contains spoilers.
      </div>
    ) : (
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">
        {review.body.length > 300
          ? `${review.body.slice(0, 300)}...`
          : review.body}
      </p>
    )}

    {/* Engagement */}
    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <ThumbsUp className="h-3 w-3" />
        {review.likesCount}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className="h-3 w-3" />
        {review.commentsCount}
      </span>
    </div>
  </div>
);
