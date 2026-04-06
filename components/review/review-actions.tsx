"use client";

import { useState } from "react";
import { ThumbsUp, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  const [likes, setLikes] = useState(initialLikes);
  const [saves, setSaves] = useState(initialSaves);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    setIsLoading(true);
    try {
      if (liked) {
        await api.delete(`/v1/reviews/${reviewId}/like`);
        setLikes((l) => l - 1);
        setLiked(false);
      } else {
        await api.post(`/v1/reviews/${reviewId}/like`);
        setLikes((l) => l + 1);
        setLiked(true);
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      window.location.href = "/sign-in";
      return;
    }
    setIsLoading(true);
    try {
      if (saved) {
        await api.delete(`/v1/reviews/${reviewId}/save`);
        setSaves((s) => s - 1);
        setSaved(false);
      } else {
        await api.post(`/v1/reviews/${reviewId}/save`);
        setSaves((s) => s + 1);
        setSaved(true);
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1.5 text-xs ${liked ? "text-shelvitas-green" : "text-muted-foreground"}`}
        onClick={handleLike}
        disabled={isLoading}
      >
        <ThumbsUp className={`h-4 w-4 ${liked ? "fill-shelvitas-green" : ""}`} />
        {likes}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1.5 text-xs ${saved ? "text-shelvitas-orange" : "text-muted-foreground"}`}
        onClick={handleSave}
        disabled={isLoading}
      >
        <Bookmark className={`h-4 w-4 ${saved ? "fill-shelvitas-orange" : ""}`} />
        {saves}
      </Button>
    </div>
  );
};
