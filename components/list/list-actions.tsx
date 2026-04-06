"use client";

import { useState } from "react";
import { Heart, Copy, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface ListActionsProps {
  listId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  listTitle: string;
}

export const ListActions = ({
  listId,
  initialLikes,
  initialIsLiked,
  listTitle,
}: ListActionsProps) => {
  const session = useAuthStore((s) => s.session);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);

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
        await api.delete(`/v1/lists/${listId}/like`);
      } else {
        await api.post(`/v1/lists/${listId}/like`);
      }
    } catch {
      setLiked(wasLiked);
      setLikes((l) => (wasLiked ? l + 1 : l - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleClone = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    setCloneLoading(true);
    try {
      const cloned = await api.post<{ id: string }>(
        `/v1/lists/${listId}/clone`,
      );
      window.location.href = `/lists/${cloned.id}`;
    } catch {
      setCloneLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/lists/${listId}`;
    const text = encodeURIComponent(`${listTitle} on Shelvitas`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1.5 text-xs transition-all ${liked ? "text-red-400" : "text-muted-foreground"}`}
        onClick={handleLike}
        disabled={likeLoading}
      >
        {likeLoading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Heart className={`h-4 w-4 transition-all ${liked ? "fill-red-400 scale-110" : ""}`} />
        )}
        {likes}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs text-muted-foreground"
        onClick={handleClone}
        disabled={cloneLoading}
      >
        {cloneLoading ? <Spinner className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        Clone
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs text-muted-foreground"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
};
