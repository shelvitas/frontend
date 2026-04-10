"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  LogOut,
  Trash2,
  Upload,
  Download,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Mail,
  User,
  Shield,
  Key,
  Globe,
  MapPin,
} from "lucide-react";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/store/auth";
import { createClient } from "@/lib/supabase/client";

interface NotificationPreferences {
  inAppFollow: boolean;
  inAppFollowRequest: boolean;
  inAppReviewLike: boolean;
  inAppComment: boolean;
  inAppShelfLike: boolean;
  emailFollow: boolean;
  emailReviewLike: boolean;
  emailComment: boolean;
  emailDigest: boolean;
  pushFollow: boolean;
  pushComment: boolean;
  pushReviewLike: boolean;
}

const defaultPrefs: NotificationPreferences = {
  inAppFollow: true,
  inAppFollowRequest: true,
  inAppReviewLike: true,
  inAppComment: true,
  inAppShelfLike: true,
  emailFollow: true,
  emailReviewLike: false,
  emailComment: true,
  emailDigest: true,
  pushFollow: true,
  pushComment: true,
  pushReviewLike: false,
};

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: typeof Settings;
  title: string;
}) => (
  <div className="flex items-center gap-2 border-b border-secondary pb-2">
    <Icon className="h-4 w-4 text-shelvitas-green" />
    <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

const SettingsPage = () => {
  const { session, profile, setProfile } = useAuthStore();
  const { signOut } = useAuth();
  const { toast } = useToast();

  // Profile fields
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [visibility, setVisibility] = useState(
    profile?.profileVisibility ?? "public",
  );
  const [isSaving, setIsSaving] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notifications
  const [notifPrefs, setNotifPrefs] =
    useState<NotificationPreferences>(defaultPrefs);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Load notification preferences
  useEffect(() => {
    api
      .get<NotificationPreferences>("/v1/notifications/preferences")
      .then(setNotifPrefs)
      .catch(() => {});
  }, []);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const updated = await api.patch<typeof profile>(
        `/v1/profile/${profile.username}`,
        {
          displayName,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          websiteUrl: websiteUrl || null,
          location: location || null,
          profileVisibility: visibility,
        },
      );
      setProfile(updated);
      toast("Profile updated");
    } catch {
      toast("Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Passwords don't match", "error");
      return;
    }
    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast("Failed to update password", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    try {
      await api.patch("/v1/notifications/preferences", notifPrefs);
      toast("Notification preferences saved");
    } catch {
      toast("Failed to save", "error");
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const updateNotifPref = (key: keyof NotificationPreferences) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile?.username) return;
    setIsDeleting(true);
    try {
      await api.delete("/v1/auth/account");
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      toast("Failed to delete account", "error");
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container flex max-w-xl flex-1 flex-col py-10">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-shelvitas-green" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="mt-8 space-y-10">
          {/* ── Profile ── */}
          <section className="space-y-4">
            <SectionHeader icon={User} title="Profile" />

            <div>
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border-secondary bg-secondary/50"
              />
            </div>

            <div>
              <Label>Bio</Label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Tell readers about yourself..."
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                {bio.length}/500
              </p>
            </div>

            <div>
              <Label>Avatar URL</Label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="border-secondary bg-secondary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  <MapPin className="mr-1 inline h-3 w-3" />
                  Location
                </Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="border-secondary bg-secondary/50"
                />
              </div>
              <div>
                <Label>
                  <Globe className="mr-1 inline h-3 w-3" />
                  Website
                </Label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="border-secondary bg-secondary/50"
                />
              </div>
            </div>

            <Button
              className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? <Spinner /> : <Save className="h-4 w-4" />}
              Save profile
            </Button>
          </section>

          {/* ── Privacy ── */}
          <section className="space-y-4">
            <SectionHeader icon={Shield} title="Privacy" />

            <div>
              <Label>Profile Visibility</Label>
              <div className="flex gap-2">
                <Button
                  variant={visibility === "public" ? "default" : "outline"}
                  size="sm"
                  className={`gap-1.5 ${visibility === "public" ? "bg-shelvitas-green text-background" : ""}`}
                  onClick={() => setVisibility("public")}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Public
                </Button>
                <Button
                  variant={visibility === "private" ? "default" : "outline"}
                  size="sm"
                  className={`gap-1.5 ${visibility === "private" ? "bg-shelvitas-green text-background" : ""}`}
                  onClick={() => setVisibility("private")}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  Private
                </Button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {visibility === "private"
                  ? "Only approved followers can see your full profile, books, and reviews."
                  : "Anyone can see your profile, books, and reviews."}
              </p>
            </div>
          </section>

          {/* ── Password ── */}
          <section className="space-y-4">
            <SectionHeader icon={Key} title="Password" />

            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="border-secondary bg-secondary/50"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="border-secondary bg-secondary/50"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword}
            >
              {isChangingPassword ? <Spinner /> : <Key className="h-4 w-4" />}
              Update password
            </Button>
          </section>

          {/* ── Notifications ── */}
          <section className="space-y-4">
            <SectionHeader icon={Bell} title="Notifications" />

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Bell className="h-3 w-3" /> In-App
              </p>
              <div className="space-y-2">
                <Checkbox
                  checked={notifPrefs.inAppFollow}
                  onChange={() => updateNotifPref("inAppFollow")}
                  label="New followers"
                />
                <Checkbox
                  checked={notifPrefs.inAppFollowRequest}
                  onChange={() => updateNotifPref("inAppFollowRequest")}
                  label="Follow requests"
                />
                <Checkbox
                  checked={notifPrefs.inAppReviewLike}
                  onChange={() => updateNotifPref("inAppReviewLike")}
                  label="Review likes"
                />
                <Checkbox
                  checked={notifPrefs.inAppComment}
                  onChange={() => updateNotifPref("inAppComment")}
                  label="Comments on your reviews"
                />
                <Checkbox
                  checked={notifPrefs.inAppShelfLike}
                  onChange={() => updateNotifPref("inAppShelfLike")}
                  label="Shelf likes"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="h-3 w-3" /> Email
              </p>
              <div className="space-y-2">
                <Checkbox
                  checked={notifPrefs.emailFollow}
                  onChange={() => updateNotifPref("emailFollow")}
                  label="New followers"
                />
                <Checkbox
                  checked={notifPrefs.emailComment}
                  onChange={() => updateNotifPref("emailComment")}
                  label="Comments"
                />
                <Checkbox
                  checked={notifPrefs.emailReviewLike}
                  onChange={() => updateNotifPref("emailReviewLike")}
                  label="Review likes"
                />
                <Checkbox
                  checked={notifPrefs.emailDigest}
                  onChange={() => updateNotifPref("emailDigest")}
                  label="Weekly reading digest"
                />
              </div>
            </div>

            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSaveNotifications}
              disabled={isSavingNotifs}
            >
              {isSavingNotifs ? (
                <Spinner />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Save preferences
            </Button>
          </section>

          {/* ── Data ── */}
          <section className="space-y-4">
            <SectionHeader icon={Download} title="Your Data" />

            <div className="flex gap-3">
              <Link href="/import">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Import from Goodreads
                </Button>
              </Link>
              <Link href="/export">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export your data
                </Button>
              </Link>
            </div>
          </section>

          {/* ── Account ── */}
          <section className="space-y-4">
            <SectionHeader icon={LogOut} title="Account" />

            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </section>

          {/* ── Danger Zone ── */}
          <section className="space-y-4 rounded-sm border border-shelvitas-red/20 p-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-shelvitas-red" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-shelvitas-red">
                Danger Zone
              </h2>
            </div>

            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all data — books, reviews,
              shelves, diary entries. This cannot be undone.
            </p>

            <div>
              <Label>
                Type your username to confirm:{" "}
                <span className="font-bold text-foreground">
                  {profile?.username}
                </span>
              </Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={profile?.username}
                className="border-shelvitas-red/20 bg-secondary/50"
              />
            </div>

            <Button
              variant="outline"
              className="gap-2 border-shelvitas-red/30 text-shelvitas-red hover:bg-shelvitas-red/10"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== profile?.username || isDeleting}
            >
              {isDeleting ? <Spinner /> : <Trash2 className="h-4 w-4" />}
              Delete my account
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
