"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Profile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  profileVisibility: "public" | "private";
}

const ProfilePage = () => {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [provider, setProvider] = useState<string>("email");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
        setProvider(user.app_metadata?.provider || "email");
      }

      try {
        const data = await api.get<Profile>("/v1/auth/me");
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    };

    load();
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-bold">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{profile.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bio</p>
              <p>{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visibility</p>
              <p className="text-sm capitalize">{profile.profileVisibility}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Provider</p>
            <p className="text-sm capitalize">{provider}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProfilePage;
