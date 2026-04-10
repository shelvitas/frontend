"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FollowButton } from "@/components/profile/follow-button";
import { PageLoader } from "@/components/ui/page-loader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { RemoteImage } from "@/components/ui/remote-image";

interface Member {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  profileVisibility: "public" | "private";
}

const MembersPage = () => {
  const { session, profile } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const data = await api.get<Member[]>("/v1/users");
      setMembers(data);
    } catch {
      // handle silently
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  // Filter out self
  const otherMembers = members.filter((m) => m.id !== profile?.id);

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container flex max-w-2xl flex-1 flex-col py-10">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-shelvitas-green" />
          <h1 className="text-2xl font-bold">Members</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover readers and follow them to build your feed.
        </p>

        {isLoading && <PageLoader />}

        {!isLoading && otherMembers.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No members yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to invite your friends to Shelvitas.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          {otherMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 rounded-sm p-4"
            >
              {/* Avatar */}
              <Link href={`/${member.username}`} className="shrink-0">
                {member.avatarUrl ? (
                  <RemoteImage
                    src={member.avatarUrl}
                    alt={member.displayName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full transition-opacity hover:opacity-80"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-semibold">
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/${member.username}`}
                  className="text-sm font-medium hover:text-shelvitas-green"
                >
                  {member.displayName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  @{member.username}
                </p>
                {member.bio && (
                  <p className="mt-1 line-clamp-1 text-xs text-foreground/70">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* Follow button */}
              <FollowButton
                userId={member.id}
                initialIsFollowing={null}
                isPrivate={member.profileVisibility === "private"}
              />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MembersPage;
