"use client";

import { useState } from "react";
import { Settings, Save } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const SettingsPage = () => {
  const { session, profile, setProfile } = useAuthStore();

  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [visibility, setVisibility] = useState(
    profile?.profileVisibility ?? "public",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const updated = await api.patch<typeof profile>(
        `/v1/profile/${profile.username}`,
        {
          displayName,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          profileVisibility: visibility,
        },
      );
      setProfile(updated);
      setSaved(true);
      toast("Profile updated");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast("Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container flex max-w-xl flex-1 flex-col py-10">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-shelvitas-green" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="displayName"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Display Name
            </label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border-secondary bg-secondary/50"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Bio
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Tell readers about yourself..."
            />
          </div>

          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="avatarUrl"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Avatar URL
            </label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="border-secondary bg-secondary/50"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Profile Visibility
            </p>
            <div className="flex gap-2">
              <Button
                variant={visibility === "public" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisibility("public")}
              >
                Public
              </Button>
              <Button
                variant={visibility === "private" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisibility("private")}
              >
                Private
              </Button>
            </div>
          </div>

          <Button
            className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Spinner /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save changes"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
