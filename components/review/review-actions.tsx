"use client";

import { useState } from "react";
import { ThumbsUp, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface ReviewActionsProps {
  reviewId: string;
  initialLikes: number;
  initialSaves: number;
}

export const ReviewActions = ({
  reviewId,
  initialLikes,
  initialSaves,
}: ReviewActionsProps) => {
  const session = useAuthStore((s) => s.session);
  const { toast } = useToast();
  const [likes, setLikes] = useState(initialLikes);
  const [saves, setSaves] = useState(initialSaves);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }

    // Optimistic
    const wasLiked = liked;
    setLiked(!liked);
    setLikes((l) => (wasLiked ? l - 1 : l + 1));
    setLikeLoading(true);

    try {
      if (wasLiked) {
        await api.delete(`/v1/reviews/${reviewId}/like`);
      } else {
        await api.post(`/v1/reviews/${reviewId}/like`);
        toast("Review liked");
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
    setSaves((s) => (wasSaved ? s - 1 : s + 1));
    setSaveLoading(true);

    try {
      if (wasSaved) {
        await api.delete(`/v1/reviews/${reviewId}/save`);
      } else {
        await api.post(`/v1/reviews/${reviewId}/save`);
        toast("Review saved");
      }
    } catch {
      setSaved(wasSaved);
      setSaves((s) => (wasSaved ? s + 1 : s - 1));
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Tooltip content={liked ? "Unlike" : "Like"}>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-xs transition-all ${liked ? "text-shelvitas-green" : "text-muted-foreground"}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          {likeLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <ThumbsUp
              className={`h-4 w-4 transition-all ${liked ? "scale-110 fill-shelvitas-green" : ""}`}
            />
          )}
          {likes}
        </Button>
      </Tooltip>
      <Tooltip content={saved ? "Unsave" : "Save"}>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-xs transition-all ${saved ? "text-shelvitas-orange" : "text-muted-foreground"}`}
          onClick={handleSave}
          disabled={saveLoading}
        >
          {saveLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Bookmark
              className={`h-4 w-4 transition-all ${saved ? "scale-110 fill-shelvitas-orange" : ""}`}
            />
          )}
          {saves}
        </Button>
      </Tooltip>
    </div>
  );
};
