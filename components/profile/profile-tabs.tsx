"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, BookMarked, Star, Library, BookCheck } from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { CreateShelfModal } from "@/components/shelf/create-shelf-modal";
import { RemoteImage } from "@/components/ui/remote-image";

const tabs = [
  { id: "read", label: "Read", icon: BookCheck },
  { id: "reading", label: "Currently Reading", icon: BookOpen },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "shelves", label: "Shelves", icon: Library },
  { id: "want", label: "Want to Read", icon: BookMarked },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface DiaryEntry {
  id: string;
  bookId: string;
  status: string;
  rating: string | null;
  book: { id: string; slug?: string; title: string; coverUrl: string | null };
}

interface Review {
  id: string;
  bookId: string;
  body: string;
  rating: string | null;
  likesCount: number;
  createdAt: string;
}

interface UserShelf {
  id: string;
  slug?: string;
  title: string;
  bookCount: number;
  likesCount: number;
}

export const ProfileTabs = ({ username }: { username: string }) => {
  const session = useAuthStore((s) => s.session);
  const [activeTab, setActiveTab] = useState<TabId>("read");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shelves, setShelves] = useState<UserShelf[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        if (
          activeTab === "read" ||
          activeTab === "reading" ||
          activeTab === "want"
        ) {
          const data = await api.get<DiaryEntry[]>(
            "/v1/diary?limit=50&offset=0",
          );
          setEntries(data);
        } else if (activeTab === "reviews") {
          const data = await api.get<Review[]>("/v1/reviews?limit=20&offset=0");
          setReviews(data);
        } else if (activeTab === "shelves") {
          const data = await api.get<UserShelf[]>(
            "/v1/shelves?limit=20&offset=0",
          );
          setShelves(data);
        }
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, session]);

  const statusMap: Record<string, string> = {
    read: "read",
    reading: "currently_reading",
    want: "want_to_read",
  };

  const filteredEntries =
    activeTab === "read" || activeTab === "reading" || activeTab === "want"
      ? entries.filter((e) => e.status === statusMap[activeTab])
      : [];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-secondary">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-shelvitas-green text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Loading...
        </div>
      )}

      {/* Book entries (Read / Reading / Want to Read) */}
      {!isLoading &&
        (activeTab === "read" ||
          activeTab === "reading" ||
          activeTab === "want") && (
          <div>
            {filteredEntries.length > 0 ? (
              <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8">
                {filteredEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/books/${entry.book.slug ?? entry.book.id}`}
                    className="group"
                  >
                    {entry.book.coverUrl ? (
                      <RemoteImage
                        src={entry.book.coverUrl}
                        alt={entry.book.title}
                        width={44}
                        height={64}
                        className="aspect-[2/3] w-full rounded-sm object-cover transition-opacity group-hover:opacity-80"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] w-full items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    )}
                    {entry.rating && (
                      <div className="mt-0.5 flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-shelvitas-orange text-shelvitas-orange" />
                        <span className="text-[10px] text-muted-foreground">
                          {entry.rating}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-muted-foreground">
                {activeTab === "read" &&
                  `${username} hasn't read any books yet.`}
                {activeTab === "reading" &&
                  `${username} isn't reading anything right now.`}
                {activeTab === "want" && `${username}'s reading list is empty.`}
              </p>
            )}
          </div>
        )}

      {/* Reviews */}
      {!isLoading && activeTab === "reviews" && (
        <div>
          {reviews.length > 0 ? (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.id}`}
                  className="block rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/20"
                >
                  <div className="flex items-center gap-2">
                    {review.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-shelvitas-orange text-shelvitas-orange" />
                        <span className="text-xs">{review.rating}</span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {review.likesCount} likes
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/80">
                    {review.body}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {username} hasn&apos;t written any reviews yet.
            </p>
          )}
        </div>
      )}

      {/* Shelves */}
      {!isLoading && activeTab === "shelves" && (
        <div>
          {shelves.length > 0 ? (
            <div className="mt-4 space-y-2">
              {shelves.map((shelf) => (
                <Link
                  key={shelf.id}
                  href={`/shelves/${shelf.slug ?? shelf.id}`}
                  className="flex items-center justify-between rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/20"
                >
                  <div>
                    <p className="text-sm font-medium">{shelf.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {shelf.bookCount} book{shelf.bookCount !== 1 ? "s" : ""}{" "}
                      &middot; {shelf.likesCount} like
                      {shelf.likesCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Library className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">
                {username} hasn&apos;t created any shelves yet.
              </p>
              <div className="mt-3">
                <CreateShelfModal
                  trigger={
                    <button
                      type="button"
                      className="text-xs text-shelvitas-green hover:underline"
                    >
                      Create your first shelf
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
