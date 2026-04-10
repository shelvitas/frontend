"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/book/review-card";
import { api } from "@/lib/api";
import type { BookReview } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

interface ReviewsListProps {
  bookId: string;
  initialReviews: BookReview[];
  totalCount: number;
}

export const ReviewsList = ({
  bookId,
  initialReviews,
  totalCount,
}: ReviewsListProps) => {
  const [reviews, setReviews] = useState<BookReview[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const hasMore = reviews.length < totalCount;

  const loadMore = async () => {
    setLoading(true);
    try {
      const data = await api.get<BookReview[]>(
        `/v1/books/${bookId}/reviews?limit=10&offset=${reviews.length}&sort=popular`,
      );
      const newReviews = Array.isArray(data) ? data : [];
      setReviews((prev) => [...prev, ...newReviews]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="divide-y divide-secondary/40">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-secondary/30 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
        >
          {loading && <Spinner className="h-3.5 w-3.5" />}
          {loading
            ? "Loading..."
            : `Show more reviews (${totalCount - reviews.length} remaining)`}
        </button>
      )}
    </div>
  );
};
