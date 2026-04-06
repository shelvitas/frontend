"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Star,
  MessageCircle,
  XCircle,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface MatchedBook {
  bookId: string;
  title: string;
  coverUrl: string | null;
  grTitle: string;
  grAuthor: string;
  grRating: number;
  grShelf: string;
}

interface UnmatchedBook {
  title: string;
  author: string;
  isbn: string;
  isbn13: string;
  reason: string;
}

interface ImportPreview {
  id: string;
  matched: MatchedBook[];
  unmatched: UnmatchedBook[];
  totalRows: number;
  matchedCount: number;
  unmatchedCount: number;
  ratingsCount: number;
  reviewsCount: number;
}

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
}

type Step = "upload" | "preview" | "importing" | "done";

const ImportPage = () => {
  const session = useAuthStore((s) => s.session);
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUnmatched, setShowUnmatched] = useState(false);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/v1/import/goodreads/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
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

      if (!res.ok) {
        throw new Error("Import failed");
      }

      // Simulate progress since the API doesn't stream
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="container max-w-2xl flex-1 py-10">
        <h1 className="text-2xl font-bold">Import from Goodreads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Import your reading history from a Goodreads CSV export.
        </p>

        {/* Step indicators */}
        <div className="mt-6 flex items-center gap-2">
          {["Upload", "Preview", "Import"].map((label, i) => {
            const stepMap: Record<string, number> = {
              upload: 0,
              preview: 1,
              importing: 2,
              done: 2,
            };
            const stepIndex = stepMap[step] ?? 0;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={`h-px w-8 ${isDone ? "bg-shelvitas-green" : "bg-secondary"}`}
                  />
                )}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    isDone ? "bg-shelvitas-green text-background" : ""
                  } ${isActive && !isDone ? "border-2 border-shelvitas-green text-shelvitas-green" : ""} ${
                    !isDone && !isActive
                      ? "border border-secondary text-muted-foreground"
                      : ""
                  }`}
                >
                  {isDone ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="mt-8">
            <div
              className="flex cursor-pointer flex-col items-center gap-4 rounded-md border-2 border-dashed border-secondary py-16 transition-colors hover:border-shelvitas-green/50"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fileRef.current?.click();
              }}
            >
              {isUploading ? (
                <Spinner className="h-8 w-8" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isUploading
                    ? "Parsing your library..."
                    : "Click to upload your Goodreads CSV"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Export from Goodreads: My Books → Import/Export → Export
                  Library
                </p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && preview && (
          <div className="mt-8 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-sm border border-secondary p-3 text-center">
                <p className="text-2xl font-bold text-shelvitas-green">
                  {preview.matchedCount}
                </p>
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  Books matched
                </p>
              </div>
              <div className="rounded-sm border border-secondary p-3 text-center">
                <p className="text-2xl font-bold">{preview.ratingsCount}</p>
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  Ratings
                </p>
              </div>
              <div className="rounded-sm border border-secondary p-3 text-center">
                <p className="text-2xl font-bold">{preview.reviewsCount}</p>
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="h-3 w-3" />
                  Reviews
                </p>
              </div>
              <div className="rounded-sm border border-secondary p-3 text-center">
                <p className="text-2xl font-bold text-shelvitas-orange">
                  {preview.unmatchedCount}
                </p>
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <XCircle className="h-3 w-3" />
                  Unmatched
                </p>
              </div>
            </div>

            {/* Matched books preview */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Books to import ({preview.matchedCount})
              </h2>
              <div className="mt-2 max-h-60 space-y-1 overflow-y-auto rounded-sm border border-secondary p-2">
                {preview.matched.slice(0, 20).map((m) => (
                  <div
                    key={m.bookId}
                    className="flex items-center gap-2 rounded-sm px-2 py-1 text-xs"
                  >
                    <FileText className="h-3 w-3 shrink-0 text-shelvitas-green" />
                    <span className="flex-1 truncate">{m.title}</span>
                    {m.grRating > 0 && (
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <Star className="h-2.5 w-2.5 fill-shelvitas-orange text-shelvitas-orange" />
                        {m.grRating}
                      </span>
                    )}
                  </div>
                ))}
                {preview.matchedCount > 20 && (
                  <p className="px-2 py-1 text-[10px] text-muted-foreground">
                    + {preview.matchedCount - 20} more books
                  </p>
                )}
              </div>
            </div>

            {/* Unmatched toggle */}
            {preview.unmatchedCount > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowUnmatched(!showUnmatched)}
                  className="text-xs text-shelvitas-orange hover:underline"
                >
                  {showUnmatched ? "Hide" : "Show"} {preview.unmatchedCount}{" "}
                  unmatched books
                </button>
                {showUnmatched && (
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-sm border border-secondary/50 p-2">
                    {preview.unmatched.map((u) => (
                      <div
                        key={`unmatched-${u.isbn13 || u.isbn || u.title}`}
                        className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground"
                      >
                        <XCircle className="h-3 w-3 shrink-0 text-shelvitas-orange/50" />
                        <span className="flex-1 truncate">
                          {u.title} — {u.author}
                        </span>
                        <span className="shrink-0 text-[10px]">{u.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setPreview(null);
                }}
              >
                Upload different file
              </Button>
              <Button
                className="flex-1 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
                onClick={handleConfirm}
              >
                Import {preview.matchedCount} books
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === "importing" && (
          <div className="mt-16 space-y-4 text-center">
            <Spinner className="mx-auto h-8 w-8" />
            <p className="text-sm font-medium">Importing your books...</p>
            <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-shelvitas-green transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && result && (
          <div className="mt-16 space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-shelvitas-green" />
            <h2 className="text-xl font-bold">Import complete</h2>
            <p className="text-sm text-muted-foreground">
              {result.imported} books imported
              {result.skipped > 0 &&
                `, ${result.skipped} skipped (already in your library)`}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/diary";
                }}
              >
                View diary
              </Button>
              <Button
                className="bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
                onClick={() => {
                  window.location.href = "/profile";
                }}
              >
                View profile
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ImportPage;
