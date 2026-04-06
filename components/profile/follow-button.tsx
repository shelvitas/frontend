"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean | null;
  isPrivate: boolean;
}

export const FollowButton = ({
  userId,
  initialIsFollowing,
  isPrivate,
}: FollowButtonProps) => {
  const session = useAuthStore((s) => s.session);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return (
      <Button
        size="sm"
        className="gap-1.5 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
        onClick={() => {
          window.location.href = "/sign-in";
        }}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Follow
      </Button>
    );
  }

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const result = await api.post<{ status: string }>(
        `/v1/users/${userId}/follow`,
      );
      if (result.status === "pending") {
        setIsPending(true);
      } else {
        setIsFollowing(true);
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    const wasPending = isPending;
    setIsFollowing(false);
    setIsPending(false);
    setIsLoading(true);
    try {
      await api.delete(`/v1/users/${userId}/follow`);
    } catch {
      // Revert
      if (wasPending) setIsPending(true);
      else setIsFollowing(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs transition-all"
        onClick={handleUnfollow}
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        )}
        Requested
      </Button>
    );
  }

  if (isFollowing) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs transition-all"
        onClick={handleUnfollow}
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" />
        )}
        Following
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="gap-1.5 bg-shelvitas-green font-semibold text-background transition-all hover:bg-shelvitas-green/90"
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Spinner className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {isPrivate ? "Request" : "Follow"}
    </Button>
  );
};
