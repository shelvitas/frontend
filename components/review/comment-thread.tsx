"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { CommentData } from "@/lib/types";
import { RemoteImage } from "@/components/ui/remote-image";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ── Single Comment ── */
const CommentNode = ({
  comment,
  depth,
  reviewId,
  shelfId,
  replyTo,
  setReplyTo,
  onCommentAdded,
}: {
  comment: CommentData;
  depth: number;
  reviewId?: string;
  shelfId?: string;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  onCommentAdded: (parentId: string, comment: CommentData) => void;
}) => {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const [collapsed, setCollapsed] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [liked, setLiked] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasReplies = (comment.replies?.length ?? 0) > 0;
  const replyCount = comment.replies?.length ?? 0;
  const isReplying = replyTo === comment.id;

  const handleReply = () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    setReplyTo(isReplying ? null : comment.id);
    setReplyBody("");
  };

  const submitReply = async () => {
    if (!replyBody.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await api.post<CommentData>("/v1/comments", {
        ...(reviewId && { reviewId }),
        ...(shelfId && { shelfId }),
        parentId: comment.id,
        body: replyBody.trim(),
      });
      onCommentAdded(comment.id, {
        ...created,
        author: {
          username: profile?.username ?? "",
          displayName: profile?.displayName ?? "",
          avatarUrl: profile?.avatarUrl ?? null,
        },
        replies: [],
      });
      setReplyBody("");
      setReplyTo(null);
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="group/comment">
      <div className="flex gap-0">
        {/* Thread line + collapse */}
        {depth > 0 && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-5 shrink-0 cursor-pointer justify-center pt-2"
            aria-label={collapsed ? "Expand thread" : "Collapse thread"}
          >
            <div className="h-full w-px bg-secondary/60 transition-colors hover:w-0.5 hover:bg-shelvitas-green/50" />
          </button>
        )}

        <div className="min-w-0 flex-1 py-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link href={`/${comment.author.username}`} className="shrink-0">
              {comment.author.avatarUrl ? (
                <RemoteImage
                  src={comment.author.avatarUrl}
                  alt={comment.author.displayName}
                  width={depth === 0 ? 24 : 20}
                  height={depth === 0 ? 24 : 20}
                  className={`rounded-full ${depth === 0 ? "h-6 w-6" : "h-5 w-5"}`}
                />
              ) : (
                <div
                  className={`flex items-center justify-center rounded-full bg-secondary font-semibold ${
                    depth === 0 ? "h-6 w-6 text-[9px]" : "h-5 w-5 text-[8px]"
                  }`}
                >
                  {comment.author.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <Link
              href={`/${comment.author.username}`}
              className="text-xs font-semibold hover:text-shelvitas-green"
            >
              {comment.author.displayName}
            </Link>
            <span className="text-[10px] text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
            {collapsed && hasReplies && (
              <span className="text-[10px] text-muted-foreground">
                ({replyCount} {replyCount === 1 ? "reply" : "replies"})
              </span>
            )}
          </div>

          {/* Body */}
          {!collapsed && (
            <>
              {comment.isDeleted && (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  [deleted]
                </p>
              )}
              {!comment.isDeleted &&
                comment.containsSpoilers &&
                !showSpoiler && (
                  <button
                    type="button"
                    onClick={() => setShowSpoiler(true)}
                    className="mt-1 flex items-center gap-1 text-xs text-shelvitas-orange hover:underline"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Show spoiler
                  </button>
                )}
              {!comment.isDeleted &&
                (!comment.containsSpoilers || showSpoiler) && (
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {comment.body}
                  </p>
                )}

              {/* Actions */}
              {!comment.isDeleted && (
                <div className="mt-1.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLiked(!liked)}
                    className={`flex cursor-pointer items-center gap-1 text-[10px] transition-colors ${
                      liked
                        ? "text-shelvitas-green"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsUp
                      className={`h-3 w-3 ${liked ? "fill-shelvitas-green" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleReply}
                    className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Reply
                  </button>
                  {hasReplies && (
                    <button
                      type="button"
                      onClick={() => setCollapsed(!collapsed)}
                      className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {collapsed ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronUp className="h-3 w-3" />
                      )}
                      {collapsed ? "Show" : "Hide"} replies
                    </button>
                  )}
                </div>
              )}

              {/* Reply input */}
              {isReplying && (
                <div className="mt-2 flex items-start gap-2">
                  {profile?.avatarUrl ? (
                    <RemoteImage
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      width={20}
                      height={20}
                      className="h-5 w-5 shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[8px] font-semibold">
                      {profile?.displayName?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          replyBody.trim()
                        ) {
                          e.preventDefault();
                          submitReply();
                        }
                        if (e.key === "Escape") {
                          setReplyTo(null);
                        }
                      }}
                      placeholder={`Reply to ${comment.author.displayName}...`}
                      rows={2}
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus
                      className="w-full rounded-sm border border-secondary bg-secondary/30 px-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        className="h-6 gap-1 bg-shelvitas-green px-2.5 text-[10px] text-background hover:bg-shelvitas-green/90"
                        onClick={submitReply}
                        disabled={isSubmitting || !replyBody.trim()}
                      >
                        {isSubmitting && <Spinner className="h-2.5 w-2.5" />}
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-muted-foreground"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyBody("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Nested replies */}
              {!collapsed &&
                comment.replies?.map((reply) => (
                  <CommentNode
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    reviewId={reviewId}
                    shelfId={shelfId}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    onCommentAdded={onCommentAdded}
                  />
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Thread Container ── */
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
  const profile = useAuthStore((s) => s.profile);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<CommentData[]>(comments);

  const addReply = (parentId: string, reply: CommentData) => {
    const addToTree = (items: CommentData[]): CommentData[] =>
      items.map((c) => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies ?? []), reply] };
        }
        if (c.replies?.length) {
          return { ...c, replies: addToTree(c.replies) };
        }
        return c;
      });
    setLocalComments((prev) => addToTree(prev));
  };

  const handleSubmit = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await api.post<CommentData>("/v1/comments", {
        ...(reviewId && { reviewId }),
        ...(shelfId && { shelfId }),
        body: newComment.trim(),
      });
      setLocalComments((prev) => [
        ...prev,
        {
          ...created,
          author: {
            username: profile?.username ?? "",
            displayName: profile?.displayName ?? "",
            avatarUrl: profile?.avatarUrl ?? null,
          },
          replies: [],
        },
      ]);
      setNewComment("");
      setShowInput(false);
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* New comment */}
      {!showInput && (
        <button
          type="button"
          onClick={() => {
            if (!session) {
              window.location.href = "/sign-in";
              return;
            }
            setShowInput(true);
          }}
          className="mb-3 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Write a comment...
        </button>
      )}
      {showInput && (
        <div className="flex items-start gap-2.5 pb-3">
          {profile?.avatarUrl ? (
            <RemoteImage
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold">
              {profile?.displayName?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && newComment.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === "Escape") {
                  setShowInput(false);
                  setNewComment("");
                }
              }}
              placeholder="What are your thoughts?"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              rows={2}
              className="w-full rounded-sm border border-secondary bg-secondary/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-6 gap-1 bg-shelvitas-green px-2.5 text-[10px] text-background hover:bg-shelvitas-green/90"
                onClick={handleSubmit}
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting && <Spinner className="h-2.5 w-2.5" />}
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-muted-foreground"
                onClick={() => {
                  setShowInput(false);
                  setNewComment("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Thread */}
      <div className="divide-y divide-secondary/20">
        {localComments.map((comment) => (
          <CommentNode
            key={comment.id}
            comment={comment}
            depth={0}
            reviewId={reviewId}
            shelfId={shelfId}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            onCommentAdded={addReply}
          />
        ))}
      </div>

      {localComments.length === 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}
    </div>
  );
};
