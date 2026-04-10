"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  Bookmark,
} from "lucide-react";

import type { BookReview } from "@/lib/types";
import { RemoteImage } from "@/components/ui/remote-image";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export const ReviewCard = ({ review, bookSlug }: { review: BookReview; bookSlug?: string }) => {
  const session = useAuthStore((s) => s.session);
  const { toast } = useToast();
  const [likes, setLikes] = useState(review.likesCount);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    const wasLiked = liked;
    setLiked(!liked);
    setLikes((l) => (wasLiked ? l - 1 : l + 1));
    setLikeLoading(true);
    try {
      if (wasLiked) {
        await api.delete(`/v1/reviews/${review.id}/like`);
      } else {
        await api.post(`/v1/reviews/${review.id}/like`);
      }
    } catch {
      setLiked(wasLiked);
      setLikes((l) => (wasLiked ? l + 1 : l - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    const wasSaved = saved;
    setSaved(!saved);
    setSaveLoading(true);
    try {
      if (wasSaved) {
        await api.delete(`/v1/reviews/${review.id}/save`);
      } else {
        await api.post(`/v1/reviews/${review.id}/save`);
        toast("Review saved");
      }
    } catch {
      setSaved(wasSaved);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="py-4">
      {/* Reviewer info */}
      <div className="flex items-center gap-2">
        {review.reviewer.avatarUrl ? (
          <RemoteImage
            src={review.reviewer.avatarUrl}
            alt={review.reviewer.displayName}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
            {review.reviewer.displayName.charAt(0).toUpperCase()}
          </div>
        )}
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
        {review.isDnf && (
          <span className="ml-auto rounded-sm bg-shelvitas-red/10 px-2 py-0.5 text-[10px] font-medium text-shelvitas-red">
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
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {review.body.length > 300
            ? `${review.body.slice(0, 300)}...`
            : review.body}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex cursor-pointer items-center gap-1 text-xs transition-colors ${
            liked
              ? "text-shelvitas-green"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {likeLoading ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <ThumbsUp
              className={`h-3.5 w-3.5 ${liked ? "fill-shelvitas-green" : ""}`}
            />
          )}
          {likes}
        </button>

        <Link
          href={
            review.reviewer.username && bookSlug
              ? `/${review.reviewer.username}/book/${bookSlug}`
              : `/reviews/${review.id}`
          }
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {review.commentsCount}
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveLoading}
          className={`flex cursor-pointer items-center gap-1 text-xs transition-colors ${
            saved
              ? "text-shelvitas-orange"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {saveLoading ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <Bookmark
              className={`h-3.5 w-3.5 ${saved ? "fill-shelvitas-orange" : ""}`}
            />
          )}
        </button>
      </div>
    </div>
  );
};
