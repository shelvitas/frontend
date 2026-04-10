"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { BookReview, CommentData } from "@/lib/types";
import { RemoteImage } from "@/components/ui/remote-image";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { CommentThread } from "@/components/review/comment-thread";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const SERVER_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const ReviewCard = ({ review }: { review: BookReview }) => {
  const session = useAuthStore((s) => s.session);
  const { toast } = useToast();
  const [likes, setLikes] = useState(review.likesCount);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);

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

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Fetch comments when opened
  useEffect(() => {
    if (!showComments || comments.length > 0) return;
    setCommentsLoading(true);
    fetch(`${SERVER_API_URL}/v1/reviews/${review.id}/comments?limit=50`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setComments((json.data as CommentData[]) ?? []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }, [showComments, comments.length, review.id]);

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

      {/* Body — full text */}
      {review.containsSpoilers && !showSpoiler ? (
        <button
          type="button"
          onClick={() => setShowSpoiler(true)}
          className="mt-3 flex cursor-pointer items-center gap-2 rounded-sm bg-secondary/50 p-3 text-xs text-muted-foreground hover:bg-secondary/70"
        >
          <AlertTriangle className="h-4 w-4 text-shelvitas-orange" />
          This review contains spoilers. Click to reveal.
        </button>
      ) : (
        <div className="mt-2 text-sm leading-relaxed text-foreground/80">
          {review.body.split("\n").map((paragraph, i) => (
            <p
              key={`${review.id}-p-${String(i)}`}
              className={i > 0 ? "mt-2" : ""}
            >
              {paragraph}
            </p>
          ))}
        </div>
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

        <button
          type="button"
          onClick={toggleComments}
          className={`flex cursor-pointer items-center gap-1 text-xs transition-colors ${
            showComments
              ? "text-shelvitas-green"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {review.commentsCount}
          {showComments ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

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

      {/* Inline comment thread */}
      {showComments && (
        <div className="ml-2 mt-4 border-l border-secondary/40 pl-4">
          {commentsLoading ? (
            <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
              <Spinner className="h-3.5 w-3.5" />
              Loading comments...
            </div>
          ) : (
            <CommentThread reviewId={review.id} comments={comments} />
          )}
        </div>
      )}
    </div>
  );
};
