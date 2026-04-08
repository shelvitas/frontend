"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { CommentData } from "@/lib/types";
import { RemoteImage } from "@/components/ui/remote-image";

const CommentItem = ({
  comment,
  onReply,
  isReply = false,
}: {
  comment: CommentData;
  onReply: (parentId: string) => void;
  isReply?: boolean;
}) => {
  const [showSpoiler, setShowSpoiler] = useState(false);

  return (
    <div className={`${isReply ? "ml-8 border-l border-secondary pl-4" : ""}`}>
      <div className="flex items-start gap-2">
        {comment.author.avatarUrl ? (
          <RemoteImage
            src={comment.author.avatarUrl}
            alt={comment.author.displayName}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
            {comment.author.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/${comment.author.username}`}
              className="text-xs font-medium hover:text-shelvitas-green"
            >
              {comment.author.displayName}
            </Link>
            <span className="text-[10px] text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.isDeleted && (
              <span className="text-[10px] italic text-muted-foreground">
                deleted
              </span>
            )}
          </div>

          {comment.containsSpoilers && !showSpoiler ? (
            <button
              type="button"
              onClick={() => setShowSpoiler(true)}
              className="mt-1 flex items-center gap-1 text-xs text-shelvitas-orange hover:underline"
            >
              <AlertTriangle className="h-3 w-3" />
              Show spoiler
            </button>
          ) : (
            <p className="mt-1 text-sm text-foreground/80">{comment.body}</p>
          )}

          {!isReply && !comment.isDeleted && (
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface CommentThreadProps {
  reviewId?: string;
  shelfId?: string;
  comments: CommentData[];
}

export const CommentThread = ({
  reviewId,
  shelfId,
  comments,
}: CommentThreadProps) => {
  const session = useAuthStore((s) => s.session);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (parentId?: string) => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }

    const body = parentId ? replyBody : newComment;
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post("/v1/comments", {
        ...(reviewId && { reviewId }),
        ...(shelfId && { shelfId }),
        ...(parentId && { parentId }),
        body: body.trim(),
      });
      if (parentId) {
        setReplyBody("");
        setReplyTo(null);
      } else {
        setNewComment("");
      }
      // Ideally refresh comments here — parent should handle this
      window.location.reload();
    } catch {
      // Silently handle
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* New comment input */}
      <div className="flex gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={session ? "Write a comment..." : "Sign in to comment"}
          disabled={!session}
          rows={2}
          className="flex-1 rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button
          size="sm"
          className="gap-1.5 self-end bg-shelvitas-green text-background hover:bg-shelvitas-green/90"
          onClick={() => handleSubmit()}
          disabled={isSubmitting || !newComment.trim()}
        >
          {isSubmitting ? <Spinner className="h-3.5 w-3.5" /> : null}
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>

      {/* Comment list */}
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          <CommentItem
            comment={comment}
            onReply={(parentId) => setReplyTo(parentId)}
          />

          {/* Replies */}
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={() => {}}
              isReply
            />
          ))}

          {/* Reply input */}
          {replyTo === comment.id && (
            <div className="ml-8 flex gap-2">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="flex-1 rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex flex-col gap-1 self-end">
                <Button
                  size="sm"
                  className="h-7 gap-1 bg-shelvitas-green text-xs text-background hover:bg-shelvitas-green/90"
                  onClick={() => handleSubmit(comment.id)}
                  disabled={isSubmitting || !replyBody.trim()}
                >
                  {isSubmitting && <Spinner className="h-3 w-3" />}
                  {isSubmitting ? "Replying..." : "Reply"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyBody("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      {comments.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}
    </div>
  );
};
