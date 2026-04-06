"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Compass, Users, BookOpen, UserPlus } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FeedEventCard } from "@/components/feed/feed-event-card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { FeedEvent, FeedResponse, SocialRec } from "@/lib/types";

type Tab = "following" | "discover";

const FeedPage = () => {
  const { session, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("following");
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [recs, setRecs] = useState<SocialRec[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      try {
        const endpoint =
          activeTab === "following" ? "/v1/feed" : "/v1/feed/discover";
        const params = cursor ? `?limit=20&cursor=${cursor}` : "?limit=20";
        const data = await api.get<FeedResponse>(`${endpoint}${params}`);
        if (cursor) {
          setEvents((prev) => [...prev, ...data.events]);
        } else {
          setEvents(data.events);
        }
        setNextCursor(data.nextCursor);
      } catch {
        // Silently handle
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab],
  );

  const fetchRecs = useCallback(async () => {
    try {
      const data = await api.get<SocialRec[]>("/v1/recs?limit=5");
      setRecs(data);
    } catch {
      // Silently handle
    }
  }, []);

  useEffect(() => {
    if (!authLoading && session) {
      setEvents([]);
      setNextCursor(null);
      fetchFeed();
      if (activeTab === "discover") {
        fetchRecs();
      }
    }
  }, [authLoading, session, activeTab, fetchFeed, fetchRecs]);

  if (!session && !authLoading) {
    window.location.href = "/sign-in";
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container max-w-2xl flex-1 py-10">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-secondary">
          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "following"
                ? "border-b-2 border-shelvitas-green text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Following
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discover")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "discover"
                ? "border-b-2 border-shelvitas-green text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="h-4 w-4" />
            Discover
          </button>
        </div>

        {/* Social Recs (Discover tab) */}
        {activeTab === "discover" && recs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recommended for you
            </h2>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {recs.map(
                (rec) =>
                  rec.book && (
                    <Link
                      key={rec.book.id}
                      href={`/books/${rec.book.id}`}
                      className="shrink-0"
                    >
                      <div className="w-28">
                        {rec.book.coverUrl ? (
                          <img
                            src={rec.book.coverUrl}
                            alt={rec.book.title}
                            className="h-40 w-28 rounded-sm object-cover transition-opacity hover:opacity-80"
                          />
                        ) : (
                          <div className="flex h-40 w-28 items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
                            {rec.book.title}
                          </div>
                        )}
                        <p className="mt-1 truncate text-xs font-medium">
                          {rec.book.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {rec.recommenderCount} friend
                          {rec.recommenderCount !== 1 ? "s" : ""} rated this
                        </p>
                      </div>
                    </Link>
                  ),
              )}
            </div>
          </div>
        )}

        {/* Feed events */}
        <div className="mt-6 space-y-3">
          {events.map((event) => (
            <FeedEventCard key={event.id} event={event} />
          ))}
        </div>

        {/* Load more */}
        {nextCursor && !isLoading && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFeed(nextCursor)}
            >
              Load more
            </Button>
          </div>
        )}

        {/* Loading */}
        {isLoading && events.length === 0 && <PageLoader />}

        {/* Empty state — Following tab */}
        {!isLoading && events.length === 0 && activeTab === "following" && (
          <div className="mt-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Your feed is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Follow readers to see their activity here.
            </p>
            <Link href="/members">
              <Button
                size="sm"
                className="mt-4 gap-1.5 bg-shelvitas-green text-background hover:bg-shelvitas-green/90"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Find readers to follow
              </Button>
            </Link>
          </div>
        )}

        {/* Empty state — Discover tab */}
        {!isLoading && events.length === 0 && activeTab === "discover" && (
          <div className="mt-12 text-center">
            <Compass className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Nothing here yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Activity from the Shelvitas community will appear here.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FeedPage;
