"use client";

import { useState } from "react";
import { Download, CheckCircle, FileArchive } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const ExportPage = () => {
  const { session } = useAuthStore();
  const { toast } = useToast();
  const [exportId, setExportId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "done" | "failed"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const pollProgress = async (id: string) => {
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
      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shelvitas-export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast("Failed to download export. Please try again.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container flex max-w-xl flex-1 flex-col py-10">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-shelvitas-green" />
          <h1 className="text-2xl font-bold">Export Your Data</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Download all your Shelvitas data as a ZIP file with CSVs and JSON.
          Every book entry includes ISBN-13, Google Books ID, and Open Library
          Key.
        </p>

        <div className="mt-6 rounded-sm border border-secondary p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Included files
          </p>
          <ul className="mt-2 space-y-1 text-sm text-foreground/80">
            <li>
              <FileArchive className="mr-1.5 inline h-3 w-3 text-muted-foreground" />
              diary.csv — reading diary entries
            </li>
            <li>
              <FileArchive className="mr-1.5 inline h-3 w-3 text-muted-foreground" />
              ratings.csv — all your ratings
            </li>
            <li>
              <FileArchive className="mr-1.5 inline h-3 w-3 text-muted-foreground" />
              reviews.csv — your reviews
            </li>
            <li>
              <FileArchive className="mr-1.5 inline h-3 w-3 text-muted-foreground" />
              shelves.csv — custom shelves
            </li>
            <li>
              <FileArchive className="mr-1.5 inline h-3 w-3 text-muted-foreground" />
              lists.csv — curated lists
            </li>
            <li>
              <FileArchive className="mr-1.5 inline h-3 w-3 text-muted-foreground" />
              watchlist.csv — want to read
            </li>
            <li>
              <FileArchive className="mr-1.5 inline h-3 w-3 text-muted-foreground" />
              library.json — full structured data
            </li>
          </ul>
        </div>

        <div className="mt-6">
          {status === "idle" && (
            <Button
              className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
              onClick={startExport}
            >
              <Download className="h-4 w-4" />
              Generate Export
            </Button>
          )}

          {status === "processing" && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner />
              Generating your export... This may take a moment.
            </div>
          )}

          {status === "done" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-shelvitas-green">
                <CheckCircle className="h-4 w-4" />
                Export ready!
              </div>
              <Button
                className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Spinner /> Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download ZIP
                  </>
                )}
              </Button>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-3">
              <p className="text-sm text-red-400">
                Export failed. Please try again.
              </p>
              <Button variant="outline" onClick={startExport}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExportPage;
