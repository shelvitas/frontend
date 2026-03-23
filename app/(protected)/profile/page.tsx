"use client";

import { useCallback } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="text-sm capitalize">{value}</p>
  </div>
);

const ProfilePage = () => {
  const { user, profile, isLoading } = useAuthStore();

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/sign-in";
    return null;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading profile...</p>
            <Button
              variant="ghost"
              className="mt-4 text-xs text-muted-foreground"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container max-w-2xl flex-1 py-10">
        {/* Profile header */}
        <div className="flex items-start gap-5">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-3xl font-bold">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 text-sm text-foreground/80">{profile.bio}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleSignOut}
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </Button>
        </div>

        {/* Stats placeholder — 0 books for now */}
        <div className="mt-8 grid grid-cols-4 gap-4 text-center">
          <StatBlock label="Books" value="0" />
          <StatBlock label="This year" value="0" />
          <StatBlock label="Lists" value="0" />
          <StatBlock label="Following" value="0" />
        </div>

        {/* Info section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoBlock label="Email" value={user.email || ""} />
            <InfoBlock label="Visibility" value={profile.profileVisibility} />
            <InfoBlock
              label="Provider"
              value={user.app_metadata?.provider || "email"}
            />
            <InfoBlock
              label="Member since"
              value={new Date(user.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            />
          </div>
        </div>

        {/* Favourite books placeholder */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Favourite books
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`fav-${i + 1}`}
                className="aspect-[2/3] rounded-sm border border-dashed border-secondary bg-secondary/20"
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Add your 4 favourite books to show on your profile.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
