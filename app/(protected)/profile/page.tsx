"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  Settings,
  BookOpen,
  BookCheck,
  Star,
  Users,
  Calendar,
  MapPin,
  Globe,
  Download,
  Import,
  BadgeCheck,
  Lock,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { FavouriteBooksEditor } from "@/components/profile/favourite-books-editor";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  profileVisibility: "public" | "private";
  isVerified: boolean;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  booksReadCount: number;
  favouriteBooks: { id: string; slug?: string; title: string; coverUrl: string | null }[];
  isFollowing: boolean | null;
  isOwnProfile: boolean;
}

const ProfilePage = () => {
  const { user, profile: authProfile, isLoading: authLoading } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authProfile?.username) return;
    api
      .get<ProfileData>(`/v1/profile/${authProfile.username}`)
      .then(setProfileData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [authProfile?.username]);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <PageLoader />
        </main>
      </div>
    );
  }

  if (!user || !authProfile) {
    if (typeof window !== "undefined") window.location.href = "/sign-in";
    return null;
  }

  const p = profileData;

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="container flex max-w-2xl flex-1 flex-col py-10">
        {/* ── Header ── */}
        <div className="flex items-start gap-5">
          {authProfile.avatarUrl ? (
            <Image
              src={authProfile.avatarUrl}
              alt={authProfile.displayName}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full ring-2 ring-shelvitas-green/30 ring-offset-2 ring-offset-background"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-4xl font-bold ring-2 ring-shelvitas-green/30 ring-offset-2 ring-offset-background">
              {authProfile.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{authProfile.displayName}</h1>
              {p?.isVerified && (
                <BadgeCheck className="h-5 w-5 text-shelvitas-blue" />
              )}
              {authProfile.profileVisibility === "private" && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              @{authProfile.username}
            </p>

            {authProfile.bio && (
              <p className="mt-2 text-sm text-foreground/80">
                {authProfile.bio}
              </p>
            )}

            {/* Meta */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {p?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {p.location}
                </span>
              )}
              {p?.websiteUrl && (
                <a
                  href={p.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-shelvitas-green"
                >
                  <Globe className="h-3 w-3" />
                  {p.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5">
            <Link href="/settings">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
              >
                <Settings className="h-3 w-3" />
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </Button>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="mt-6 flex items-center justify-around rounded-sm border border-secondary bg-secondary/10 px-4 py-4">
          <Link
            href="/diary"
            className="text-center hover:text-shelvitas-green"
          >
            <p className="text-2xl font-bold">{p?.booksReadCount ?? 0}</p>
            <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <BookCheck className="h-3 w-3" />
              Books
            </p>
          </Link>
          <div className="text-center">
            <p className="text-2xl font-bold">{p?.followerCount ?? 0}</p>
            <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Users className="h-3 w-3" />
              Followers
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{p?.followingCount ?? 0}</p>
            <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Users className="h-3 w-3" />
              Following
            </p>
          </div>
        </div>

        {/* ── Favourite Books ── */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Favourite books
          </h2>
          <div className="mt-3">
            <FavouriteBooksEditor
              username={authProfile.username}
              initialBooks={p?.favouriteBooks ?? []}
              onUpdate={() => {
                if (authProfile?.username) {
                  api
                    .get<ProfileData>(`/v1/profile/${authProfile.username}`)
                    .then(setProfileData)
                    .catch(() => {});
                }
              }}
            />
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/diary">
            <div className="flex flex-col items-center gap-1.5 rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/20">
              <BookOpen className="h-5 w-5 text-shelvitas-green" />
              <span className="text-xs font-medium">Diary</span>
            </div>
          </Link>
          <Link href="/shelves">
            <div className="flex flex-col items-center gap-1.5 rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/20">
              <Star className="h-5 w-5 text-shelvitas-orange" />
              <span className="text-xs font-medium">Shelves</span>
            </div>
          </Link>
          <Link href="/import">
            <div className="flex flex-col items-center gap-1.5 rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/20">
              <Import className="h-5 w-5 text-shelvitas-blue" />
              <span className="text-xs font-medium">Import</span>
            </div>
          </Link>
          <Link href="/export">
            <div className="flex flex-col items-center gap-1.5 rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/20">
              <Download className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium">Export</span>
            </div>
          </Link>
        </div>

        {/* ── Activity Tabs ── */}
        <div className="mt-8">
          <ProfileTabs username={authProfile.username} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
