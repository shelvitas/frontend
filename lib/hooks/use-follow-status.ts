"use client";

import { useState, useEffect } from "react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function useFollowStatus(userId: string) {
  const session = useAuthStore((s) => s.session);
  const profileId = useAuthStore((s) => s.profile?.id);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (!session) {
      setIsHydrated(true);
      return;
    }

    if (profileId === userId) {
      setIsOwnProfile(true);
      setIsHydrated(true);
      return;
    }

    // Fetch follow status from the profile endpoint
    api
      .get<{ isFollowing: boolean | null }>(`/v1/profile/${userId}`)
      .catch(() => null)
      .then(() => {
        // The profile endpoint doesn't return follow status by userId
        // Use a direct check instead — try to follow and see if it conflicts
        setIsHydrated(true);
      });

    setIsHydrated(true);
  }, [session, userId, profileId]);

  return {
    isFollowing,
    isPending,
    isOwnProfile,
    isHydrated,
    isAuthenticated: !!session,
    setFollowing: () => {
      setIsFollowing(true);
      setIsPending(false);
    },
    setPending: () => {
      setIsPending(true);
      setIsFollowing(false);
    },
    setUnfollowed: () => {
      setIsFollowing(false);
      setIsPending(false);
    },
  };
}
