"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, BookOpen, Library, Download, Import } from "lucide-react";

import { Tooltip } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
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
  favouriteBooks: {
    id: string;
    slug?: string;
    title: string;
    coverUrl: string | null;
  }[];
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

      <main className="container relative flex max-w-2xl flex-1 flex-col py-10">
        {/* Settings */}
        <Link href="/settings" className="absolute right-0 top-10">
          <Tooltip content="Settings" side="bottom">
            <Settings className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
          </Tooltip>
        </Link>

        {/* ── Avatar + Stats ── */}
        <div className="flex items-center gap-20">
          {authProfile.avatarUrl ? (
            <Image
              src={authProfile.avatarUrl}
              alt={authProfile.displayName}
              width={112}
              height={112}
              className="h-28 w-28 shrink-0 rounded-full ring-2 ring-shelvitas-green/30 ring-offset-2 ring-offset-background"
            />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-secondary text-4xl font-bold ring-2 ring-shelvitas-green/30 ring-offset-2 ring-offset-background">
              {authProfile.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex items-center gap-12">
            <Link
              href="/diary"
              className="transition-colors hover:text-shelvitas-green"
            >
              <p className="text-xl font-bold">{p?.booksReadCount ?? 0}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Books
              </p>
            </Link>
            <div>
              <p className="text-xl font-bold">{p?.followerCount ?? 0}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Followers
              </p>
            </div>
            <div>
              <p className="text-xl font-bold">{p?.followingCount ?? 0}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Following
              </p>
            </div>
          </div>
        </div>

        {/* ── Name + Meta ── */}
        <div className="mt-5">
          <h1 className="text-2xl font-bold">{authProfile.displayName}</h1>

          <p className="mt-0.5 text-sm text-muted-foreground">
            @{authProfile.username}
          </p>

          {authProfile.bio && (
            <p className="mt-2 text-sm text-foreground/80">
              {authProfile.bio}
            </p>
          )}
        </div>

        {/* ── Top 4 Books ── */}
        <div className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Top 4 books
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

        {/* ── Quick Links ── */}
        <div className="mt-8 flex items-center justify-center gap-6">
          {[
            { href: "/diary", icon: BookOpen, label: "Diary", color: "text-shelvitas-green" },
            { href: "/shelves", icon: Library, label: "Shelves", color: "text-shelvitas-orange" },
            { href: "/import", icon: Import, label: "Import", color: "text-shelvitas-blue" },
            { href: "/export", icon: Download, label: "Export", color: "text-muted-foreground" },
          ].map((item) => (
            <Tooltip key={item.href} content={item.label}>
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-sm px-3 py-2 transition-colors hover:bg-secondary/30"
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-[10px] text-muted-foreground">
                  {item.label}
                </span>
              </Link>
            </Tooltip>
          ))}
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
