"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Star,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  AlertTriangle,
  Bookmark,
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

  // Voting
  const [score, setScore] = useState(review.score ?? 0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);

  // Save
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Comments
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);

  const handleVote = async (direction: "up" | "down") => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    const prevVote = userVote;
    const prevScore = score;

    // Optimistic update
    if (userVote === direction) {
      // Toggle off
      setUserVote(null);
      setScore(score + (direction === "up" ? -1 : 1));
    } else if (userVote === null) {
      // New vote
      setUserVote(direction);
      setScore(score + (direction === "up" ? 1 : -1));
    } else {
      // Flip
      setUserVote(direction);
      setScore(score + (direction === "up" ? 2 : -2));
    }

    setVoteLoading(true);
    try {
      await api.post(`/v1/reviews/${review.id}/vote`, { direction });
    } catch {
      setUserVote(prevVote);
      setScore(prevScore);
    } finally {
      setVoteLoading(false);
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

  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  // Fetch comments
  useEffect(() => {
    if (comments.length > 0) return;
    setCommentsLoading(true);
    fetch(`${SERVER_API_URL}/v1/reviews/${review.id}/comments?limit=50`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        if (mountedRef.current)
          setComments((json.data as CommentData[]) ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (mountedRef.current) setCommentsLoading(false);
      });
  }, [comments.length, review.id]);

  return (
    <div className="flex gap-3 py-4">
      {/* Vote column — Reddit style */}
      <div className="flex shrink-0 flex-col items-center gap-0.5 pt-1">
        <button
          type="button"
          onClick={() => handleVote("up")}
          disabled={voteLoading}
          className={`cursor-pointer rounded-sm p-0.5 transition-colors ${
            userVote === "up"
              ? "text-shelvitas-green"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <span
          className={`text-xs font-bold ${
            // eslint-disable-next-line no-nested-ternary
            userVote === "up"
              ? "text-shelvitas-green"
              : userVote === "down"
                ? "text-shelvitas-red"
                : "text-muted-foreground"
          }`}
        >
          {score}
        </span>
        <button
          type="button"
          onClick={() => handleVote("down")}
          disabled={voteLoading}
          className={`cursor-pointer rounded-sm p-0.5 transition-colors ${
            userVote === "down"
              ? "text-shelvitas-red"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Reviewer info */}
        <div className="flex items-center gap-2">
          {review.reviewer.avatarUrl ? (
            <RemoteImage
              src={review.reviewer.avatarUrl}
              alt={review.reviewer.displayName}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold">
              {review.reviewer.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <Link
            href={`/${review.reviewer.username}`}
            className="text-xs font-semibold hover:text-shelvitas-green"
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
        {review.containsSpoilers && !showSpoiler ? (
          <button
            type="button"
            onClick={() => setShowSpoiler(true)}
            className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm bg-secondary/50 p-3 text-xs text-muted-foreground hover:bg-secondary/70"
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
        <div className="mt-2 flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            {review.commentsCount}
          </span>

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
        <div className="mt-4 border-l border-secondary/40 pl-4">
          {commentsLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <Spinner className="h-3.5 w-3.5" />
            </div>
          ) : (
            <CommentThread reviewId={review.id} comments={comments} />
          )}
        </div>
      </div>
    </div>
  );
};
