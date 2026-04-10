import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Globe,
  Lock,
  BookOpen,
  Users,
  UserCheck,
  BadgeCheck,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FollowButton } from "@/components/profile/follow-button";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import type { ProfileData } from "@/lib/types";
import { isFullProfile } from "@/lib/types";
import { serverFetch } from "@/lib/server-fetch";
import { RemoteImage } from "@/components/ui/remote-image";
import { Tooltip } from "@/components/ui/tooltip";

async function getProfile(username: string) {
  return serverFetch<ProfileData>(`/v1/profile/${username}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return { title: "User not found" };
  }

  const description = isFullProfile(profile)
    ? profile.bio || `${profile.displayName}'s profile on Shelvitas`
    : `${profile.displayName}'s profile on Shelvitas`;

  return {
    title: `${profile.displayName} (@${profile.username})`,
    description,
    openGraph: {
      title: `${profile.displayName} (@${profile.username})`,
      description,
      type: "profile",
    },
  };
}

const StatItem = ({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) => {
  const content = (
    <div className="text-center">
      <p className="text-lg font-bold">{value.toLocaleString()}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:text-shelvitas-green">
        {content}
      </Link>
    );
  }

  return content;
};

const ProfilePage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  const full = isFullProfile(profile);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container flex max-w-3xl flex-1 flex-col py-10">
        {/* ── Profile Header ── */}
        <div className="flex items-start gap-5">
          {/* Avatar */}
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full"
              priority
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-4xl font-bold">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name + meta */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              {profile.isVerified && (
                <BadgeCheck className="h-5 w-5 text-shelvitas-blue" />
              )}
              {profile.profileVisibility === "private" && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>

            {full && profile.bio && (
              <p className="mt-2 max-w-lg text-sm text-foreground/80">
                {profile.bio}
              </p>
            )}

            {full && (profile.location || profile.websiteUrl) && (
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </span>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-shelvitas-green"
                  >
                    <Globe className="h-3 w-3" />
                    {profile.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Follow button (hidden on own profile) */}
          {!profile.isOwnProfile && (
            <FollowButton
              userId={profile.id}
              initialIsFollowing={profile.isFollowing}
              isPrivate={profile.profileVisibility === "private"}
            />
          )}
        </div>

        {/* ── Stats Strip ── */}
        <div className="mt-8 flex items-center justify-around rounded-sm border border-secondary bg-secondary/20 px-4 py-4">
          {full && (
            <StatItem
              label="Books"
              value={profile.booksReadCount}
              href={`/${username}`}
            />
          )}
          <StatItem label="Followers" value={profile.followerCount} />
          <StatItem label="Following" value={profile.followingCount} />
          {full && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <BookOpen className="h-4 w-4 text-shelvitas-green" />
                <Users className="h-4 w-4 text-shelvitas-blue" />
                <UserCheck className="h-4 w-4 text-shelvitas-orange" />
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Activity
              </p>
            </div>
          )}
        </div>

        {/* ── Private Profile Gate ── */}
        {!full && (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">This account is private</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Follow this user to see their books, reviews, and lists.
            </p>
          </div>
        )}

        {/* ── Favourite Books ── */}
        {full && profile.favouriteBooks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Favourite books
            </h2>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {profile.favouriteBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug ?? book.id}`}
                  className="group cursor-pointer"
                >
                  <Tooltip content={book.title} side="bottom" className="w-full">
                    <div className="w-full rounded-sm ring-shelvitas-green transition-all group-hover:ring-2">
                      {book.coverUrl ? (
                        <RemoteImage
                          src={book.coverUrl}
                          alt={book.title}
                          width={44}
                          height={64}
                          className="aspect-[2/3] w-full rounded-sm object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[2/3] w-full items-center justify-center rounded-sm bg-secondary text-xs text-muted-foreground">
                          {book.title}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </Link>
              ))}
            </div>
          </div>
        )}

        {full &&
          profile.favouriteBooks.length === 0 &&
          profile.isOwnProfile && (
            <div className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Favourite books
              </h2>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`empty-fav-${i + 1}`}
                    className="aspect-[2/3] rounded-sm border border-dashed border-secondary bg-secondary/20"
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Add your 4 favourite books to show on your profile.
              </p>
            </div>
          )}

        {/* ── Tabs (Read, Currently Reading, Reviews, Lists, Want to Read) ── */}
        {full && (
          <div className="mt-8">
            <ProfileTabs username={profile.username} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
