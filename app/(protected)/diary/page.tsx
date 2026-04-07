"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Calendar } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DiaryEntryCard } from "@/components/diary/diary-entry-card";
import { LogModal } from "@/components/book/log-modal";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { DiaryEntry } from "@/lib/types";

const DiaryPage = () => {
  const { session, isLoading: authLoading } = useAuthStore();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const data = await api.get<DiaryEntry[]>(`/v1/diary?limit=100&offset=0`);
      setEntries(data);
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!authLoading && session) {
      fetchEntries();
    }
  }, [authLoading, session, fetchEntries]);

  if (!session && !authLoading) {
    window.location.href = "/sign-in";
    return null;
  }

  // Extract unique years from entries for filter
  const years = Array.from(
    new Set(
      entries
        .map((e) => {
          const date = e.finishedAt ?? e.startedAt ?? e.createdAt;
          return new Date(date).getFullYear();
        })
        .filter(Boolean),
    ),
  ).sort((a, b) => b - a);

  // Filter entries by year
  const filteredEntries = yearFilter
    ? entries.filter((e) => {
        const date = e.finishedAt ?? e.startedAt ?? e.createdAt;
        return new Date(date).getFullYear() === yearFilter;
      })
    : entries;

  // Group by month for display
  const grouped = new Map<string, DiaryEntry[]>();
  filteredEntries.forEach((entry) => {
    const date = entry.finishedAt ?? entry.startedAt ?? entry.createdAt;
    const key = new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const existing = grouped.get(key) ?? [];
    existing.push(entry);
    grouped.set(key, existing);
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container flex max-w-3xl flex-1 flex-col py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-shelvitas-green" />
            <h1 className="text-2xl font-bold">Reading Diary</h1>
          </div>
        </div>

        {/* Year filter */}
        {years.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={yearFilter === null ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setYearFilter(null)}
              >
                All
              </Button>
              {years.map((year) => (
                <Button
                  key={year}
                  variant={yearFilter === year ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setYearFilter(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && <PageLoader />}

        {/* Empty state */}
        {!isLoading && entries.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center py-20">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">
              Your reading diary is empty
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start logging books to build your reading history.
            </p>
          </div>
        )}

        {/* Entries grouped by month */}
        {!isLoading &&
          Array.from(grouped.entries()).map(([month, monthEntries]) => (
            <div key={month} className="mt-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {month}
              </h2>
              <div className="space-y-3">
                {monthEntries.map((entry) => (
                  <DiaryEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={setEditEntry}
                  />
                ))}
              </div>
            </div>
          ))}
      </main>

      {/* Edit modal — opens when editEntry is set */}
      {editEntry && (
        <LogModal
          bookId={editEntry.bookId}
          bookTitle={editEntry.book.title}
          existingEntry={editEntry}
          trigger={<span />}
          onSaved={() => {
            setEditEntry(null);
            fetchEntries();
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default DiaryPage;
