"use client";

import { useState, useEffect, useRef } from "react";
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
  User,
  Shield,
  Key,
  FileArchive,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Database,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/store/auth";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

type Tab =
  | "profile"
  | "privacy"
  | "password"
  | "notifications"
  | "data"
  | "account";

const sidebarItems: {
  id: Tab;
  label: string;
  desc: string;
  icon: typeof Settings;
}[] = [
  { id: "profile", label: "Profile", desc: "Name, bio, avatar", icon: User },
  { id: "privacy", label: "Privacy", desc: "Who sees your data", icon: Shield },
  { id: "password", label: "Password", desc: "Update credentials", icon: Key },
  {
    id: "notifications",
    label: "Notifications",
    desc: "In-app & email",
    icon: Bell,
  },
  { id: "data", label: "Your Data", desc: "Import & export", icon: Database },
  { id: "account", label: "Account", desc: "Sign out & delete", icon: LogOut },
];

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-md border border-secondary/40 bg-gradient-to-b from-secondary/5 to-transparent p-5 ${className}`}
  >
    {children}
  </div>
);

const FieldGroup = ({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground/70">
      {label}
    </p>
    {desc && <p className="mb-2 text-[10px] text-muted-foreground">{desc}</p>}
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

/* ── Export Modal ── */
const ExportModal = () => {
  const { session } = useAuthStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exportId, setExportId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "done" | "failed"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const pollProgress = (id: string) => {
    const poll = async () => {
      try {
        const data = await api.get<{
          status: string;
          downloadUrl: string | null;
        }>(`/v1/export/${id}/progress`);
        if (data.status === "done" && data.downloadUrl) {
          setStatus("done");
          setDownloadUrl(data.downloadUrl);
        } else if (data.status === "failed") {
          setStatus("failed");
        } else {
          setTimeout(poll, 2000);
        }
      } catch {
        setStatus("failed");
      }
    };
    poll();
  };

  const startExport = async () => {
    setStatus("processing");
    try {
      const data = await api.post<{ exportId: string }>("/v1/export");
      setExportId(data.exportId);
      pollProgress(data.exportId);
    } catch {
      setStatus("failed");
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl || !exportId || !session?.access_token) return;
    setIsDownloading(true);
    try {
      const res = await fetch(`${API_URL}${downloadUrl}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shelvitas-export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("Export downloaded!");
    } catch {
      toast("Failed to download", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStatus("idle");
      setDownloadUrl(null);
      setExportId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export your data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-4 w-4 text-shelvitas-green" />
            Export Data
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Download all your Shelvitas data as a ZIP with CSVs and JSON.
        </p>
        <div className="rounded-sm bg-secondary/20 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Included
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1 text-xs text-foreground/70">
            {[
              "diary.csv",
              "ratings.csv",
              "reviews.csv",
              "shelves.csv",
              "watchlist.csv",
              "library.json",
            ].map((f) => (
              <span key={f} className="flex items-center gap-1">
                <FileArchive className="h-2.5 w-2.5 text-muted-foreground" />
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-2">
          {status === "idle" && (
            <Button
              className="w-full gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
              onClick={startExport}
            >
              <Download className="h-4 w-4" />
              Generate Export
            </Button>
          )}
          {status === "processing" && (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
              <Spinner /> Generating...
            </div>
          )}
          {status === "done" && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-shelvitas-green">
                <CheckCircle className="h-4 w-4" /> Export ready!
              </div>
              <Button
                className="w-full gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Spinner /> Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Download ZIP
                  </>
                )}
              </Button>
            </div>
          )}
          {status === "failed" && (
            <div className="space-y-2 text-center">
              <p className="text-sm text-shelvitas-red">Export failed.</p>
              <Button variant="outline" onClick={startExport}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── Import Modal ── */
const ImportModal = () => {
  const session = useAuthStore((s) => s.session);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">(
    "upload",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<{
    id: string;
    matched: { bookId: string; title: string; grRating: number }[];
    unmatched: { title: string; author: string; reason: string }[];
    matchedCount: number;
    unmatchedCount: number;
    ratingsCount: number;
    reviewsCount: number;
  } | null>(null);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUnmatched, setShowUnmatched] = useState(false);

  const reset = () => {
    setStep("upload");
    setPreview(null);
    setResult(null);
    setProgress(0);
    setError(null);
    setShowUnmatched(false);
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) reset();
  };

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/v1/import/goodreads/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? "Upload failed");
      }
      const json = await res.json();
      setPreview(json.data);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setStep("importing");
    setProgress(0);
    try {
      const res = await fetch(`${API_URL}/v1/import/goodreads/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ importId: preview.id }),
      });
      if (!res.ok) throw new Error("Import failed");
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 95) {
            clearInterval(interval);
            return 95;
          }
          return p + Math.random() * 15;
        });
      }, 200);
      const json = await res.json();
      clearInterval(interval);
      setProgress(100);
      setResult(json.data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStep("preview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          Import from Goodreads
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-shelvitas-green" />
            Import from Goodreads
          </DialogTitle>
        </DialogHeader>
        {error && (
          <div className="flex items-center gap-2 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
        {step === "upload" && (
          <div>
            <div
              className="flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed border-secondary py-10 transition-colors hover:border-shelvitas-green/50"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fileRef.current?.click();
              }}
            >
              {isUploading ? (
                <Spinner className="h-6 w-6" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isUploading ? "Parsing..." : "Click to upload CSV"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Goodreads → My Books → Import/Export → Export Library
                </p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </div>
        )}
        {step === "preview" && preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  n: preview.matchedCount,
                  label: "Matched",
                  color: "text-shelvitas-green",
                },
                { n: preview.ratingsCount, label: "Ratings", color: "" },
                { n: preview.reviewsCount, label: "Reviews", color: "" },
                {
                  n: preview.unmatchedCount,
                  label: "Unmatched",
                  color: "text-shelvitas-red",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-sm bg-secondary/30 p-2 text-center"
                >
                  <p className={`text-lg font-bold ${s.color}`}>{s.n}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="max-h-40 overflow-y-auto rounded-sm border border-secondary p-2">
              {preview.matched.slice(0, 20).map((m) => (
                <div
                  key={m.bookId}
                  className="flex items-center gap-2 px-1 py-0.5 text-xs"
                >
                  <CheckCircle className="h-2.5 w-2.5 shrink-0 text-shelvitas-green" />
                  <span className="flex-1 truncate">{m.title}</span>
                  {m.grRating > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {m.grRating}★
                    </span>
                  )}
                </div>
              ))}
              {preview.matchedCount > 20 && (
                <p className="px-1 py-0.5 text-[10px] text-muted-foreground">
                  + {preview.matchedCount - 20} more
                </p>
              )}
            </div>
            {preview.unmatchedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowUnmatched(!showUnmatched)}
                className="text-xs text-shelvitas-red hover:underline"
              >
                {showUnmatched ? "Hide" : "Show"} {preview.unmatchedCount}{" "}
                unmatched
              </button>
            )}
            {showUnmatched && (
              <div className="max-h-32 overflow-y-auto rounded-sm border border-secondary/50 p-2">
                {preview.unmatched.map((u) => (
                  <div
                    key={`um-${u.title}`}
                    className="flex items-center gap-2 px-1 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <XCircle className="h-2.5 w-2.5 shrink-0 text-shelvitas-red/50" />
                    <span className="flex-1 truncate">
                      {u.title} — {u.author}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={reset}>
                Different file
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
                onClick={handleConfirm}
              >
                Import {preview.matchedCount} books
              </Button>
            </div>
          </div>
        )}
        {step === "importing" && (
          <div className="space-y-3 py-6 text-center">
            <Spinner className="mx-auto h-6 w-6" />
            <p className="text-sm font-medium">Importing...</p>
            <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-shelvitas-green transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
        {step === "done" && result && (
          <div className="space-y-3 py-4 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-shelvitas-green" />
            <p className="text-lg font-bold">Import complete</p>
            <p className="text-xs text-muted-foreground">
              {result.imported} books imported
              {result.skipped > 0 && `, ${result.skipped} already in library`}
            </p>
            <Button
              size="sm"
              className="bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
              onClick={() => handleOpen(false)}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ── Tab Panels ── */

const ProfileTab = () => {
  const { profile, setProfile } = useAuthStore();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
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

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <FieldGroup
            label="Display Name"
            desc="How other readers will see you"
          >
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border-secondary bg-secondary/50"
            />
          </FieldGroup>
          <FieldGroup
            label="Bio"
            desc="A short intro — show up on your profile card"
          >
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
          </FieldGroup>
        </div>
      </Card>

      <Card>
        <div className="space-y-5">
          <FieldGroup
            label="Avatar URL"
            desc="Paste a link to your profile picture"
          >
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="border-secondary bg-secondary/50"
            />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Location">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="border-secondary bg-secondary/50"
              />
            </FieldGroup>
            <FieldGroup label="Website">
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="border-secondary bg-secondary/50"
              />
            </FieldGroup>
          </div>
        </div>
      </Card>

      <Button
        className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Spinner /> : <Save className="h-4 w-4" />}
        Save profile
      </Button>
    </div>
  );
};

const PrivacyTab = () => {
  const { profile, setProfile } = useAuthStore();
  const { toast } = useToast();
  const [visibility, setVisibility] = useState(
    profile?.profileVisibility ?? "public",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const updated = await api.patch<typeof profile>(
        `/v1/profile/${profile.username}`,
        { profileVisibility: visibility },
      );
      setProfile(updated);
      toast("Privacy updated");
    } catch {
      toast("Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup
          label="Profile Visibility"
          desc="Control who can see your reading activity"
        >
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 transition-all ${
                visibility === "public"
                  ? "border-shelvitas-green bg-shelvitas-green/5"
                  : "border-secondary hover:border-secondary/80"
              }`}
            >
              <Eye
                className={`h-6 w-6 ${visibility === "public" ? "text-shelvitas-green" : "text-muted-foreground"}`}
              />
              <span
                className={`text-sm font-semibold ${visibility === "public" ? "text-shelvitas-green" : ""}`}
              >
                Public
              </span>
              <span className="text-center text-[10px] text-muted-foreground">
                Anyone can see your profile, books, and reviews
              </span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 transition-all ${
                visibility === "private"
                  ? "border-shelvitas-green bg-shelvitas-green/5"
                  : "border-secondary hover:border-secondary/80"
              }`}
            >
              <EyeOff
                className={`h-6 w-6 ${visibility === "private" ? "text-shelvitas-green" : "text-muted-foreground"}`}
              />
              <span
                className={`text-sm font-semibold ${visibility === "private" ? "text-shelvitas-green" : ""}`}
              >
                Private
              </span>
              <span className="text-center text-[10px] text-muted-foreground">
                Only approved followers can see your full profile
              </span>
            </button>
          </div>
        </FieldGroup>
      </Card>

      <Button
        className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Spinner /> : <Save className="h-4 w-4" />}
        Save
      </Button>
    </div>
  );
};

const PasswordTab = () => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async () => {
    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Passwords don't match", "error");
      return;
    }
    setIsChanging(true);
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
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <FieldGroup label="New Password" desc="Must be at least 6 characters">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="border-secondary bg-secondary/50"
            />
          </FieldGroup>
          <FieldGroup label="Confirm Password">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="border-secondary bg-secondary/50"
            />
          </FieldGroup>
        </div>
      </Card>
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleChange}
        disabled={isChanging || !newPassword}
      >
        {isChanging ? <Spinner /> : <Key className="h-4 w-4" />}
        Update password
      </Button>
    </div>
  );
};

const NotificationsTab = () => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api
      .get<NotificationPreferences>("/v1/notifications/preferences")
      .then(setPrefs)
      .catch(() => {});
  }, []);

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch("/v1/notifications/preferences", prefs);
      toast("Preferences saved");
    } catch {
      toast("Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup
          label="In-App Notifications"
          desc="Activity alerts inside Shelvitas"
        >
          <div className="mt-1 space-y-2.5">
            <Checkbox
              checked={prefs.inAppFollow}
              onChange={() => toggle("inAppFollow")}
              label="New followers"
            />
            <Checkbox
              checked={prefs.inAppFollowRequest}
              onChange={() => toggle("inAppFollowRequest")}
              label="Follow requests"
            />
            <Checkbox
              checked={prefs.inAppReviewLike}
              onChange={() => toggle("inAppReviewLike")}
              label="Review likes"
            />
            <Checkbox
              checked={prefs.inAppComment}
              onChange={() => toggle("inAppComment")}
              label="Comments on your reviews"
            />
            <Checkbox
              checked={prefs.inAppShelfLike}
              onChange={() => toggle("inAppShelfLike")}
              label="Shelf likes"
            />
          </div>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup label="Email Notifications" desc="Delivered to your inbox">
          <div className="mt-1 space-y-2.5">
            <Checkbox
              checked={prefs.emailFollow}
              onChange={() => toggle("emailFollow")}
              label="New followers"
            />
            <Checkbox
              checked={prefs.emailComment}
              onChange={() => toggle("emailComment")}
              label="Comments"
            />
            <Checkbox
              checked={prefs.emailReviewLike}
              onChange={() => toggle("emailReviewLike")}
              label="Review likes"
            />
            <Checkbox
              checked={prefs.emailDigest}
              onChange={() => toggle("emailDigest")}
              label="Weekly reading digest"
            />
          </div>
        </FieldGroup>
      </Card>

      <Button
        variant="outline"
        className="gap-2"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Spinner /> : <BellOff className="h-4 w-4" />}
        Save preferences
      </Button>
    </div>
  );
};

const DataTab = () => (
  <div className="space-y-6">
    <Card>
      <FieldGroup
        label="Import"
        desc="Bring your reading history from another platform"
      >
        <div className="mt-2">
          <ImportModal />
        </div>
      </FieldGroup>
    </Card>
    <Card>
      <FieldGroup
        label="Export"
        desc="Download a full backup of your Shelvitas data"
      >
        <div className="mt-2">
          <ExportModal />
        </div>
      </FieldGroup>
    </Card>
  </div>
);

const AccountTab = () => {
  const { profile } = useAuthStore();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleDelete = async () => {
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

  return (
    <div className="space-y-8">
      {/* Sign out */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{profile?.email}</span>
        </p>
        <Button variant="outline" className="gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Danger zone */}
      <div className="space-y-4 rounded-sm border border-shelvitas-red/20 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-shelvitas-red">
          <Trash2 className="h-4 w-4" /> Danger Zone
        </h3>
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
          onClick={handleDelete}
          disabled={deleteConfirm !== profile?.username || isDeleting}
        >
          {isDeleting ? <Spinner /> : <Trash2 className="h-4 w-4" />}
          Delete my account
        </Button>
      </div>
    </div>
  );
};

/* ── Settings Page ── */
const SettingsPage = () => {
  const { session } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const tabPanels: Record<
    Tab,
    { title: string; icon: typeof Settings; component: React.ReactNode }
  > = {
    profile: { title: "Profile", icon: User, component: <ProfileTab /> },
    privacy: { title: "Privacy", icon: Shield, component: <PrivacyTab /> },
    password: { title: "Password", icon: Key, component: <PasswordTab /> },
    notifications: {
      title: "Notifications",
      icon: Bell,
      component: <NotificationsTab />,
    },
    data: { title: "Your Data", icon: Database, component: <DataTab /> },
    account: { title: "Account", icon: LogOut, component: <AccountTab /> },
  };

  const active = tabPanels[activeTab];
  const ActiveIcon = active.icon;

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container flex max-w-4xl flex-1 gap-10 py-10">
        {/* Sidebar */}
        <nav className="sticky top-24 hidden h-fit w-48 shrink-0 space-y-0.5 md:block">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4 text-shelvitas-green" />
            <span className="text-sm font-bold">Settings</span>
          </div>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-secondary/50 font-medium text-shelvitas-green"
                    : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile tab bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-secondary pb-2 md:hidden">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 items-center gap-1 rounded-sm px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-secondary/50 text-shelvitas-green"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div className="min-w-0 flex-1">
          <div className="mb-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-shelvitas-green/10">
                <ActiveIcon className="h-4.5 w-4.5 text-shelvitas-green" />
              </div>
              <h1 className="text-xl font-bold">{active.title}</h1>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-shelvitas-green/20 via-secondary/40 to-transparent" />
          </div>
          {active.component}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
