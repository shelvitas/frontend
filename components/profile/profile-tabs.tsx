"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookMarked,
  Star,
  Library,
  BookCheck,
  BookX,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { CreateShelfModal } from "@/components/shelf/create-shelf-modal";
import { RemoteImage } from "@/components/ui/remote-image";
import { PageLoader } from "@/components/ui/page-loader";
import { Tooltip } from "@/components/ui/tooltip";

const tabs = [
  {
    id: "read",
    label: "Read",
    icon: BookCheck,
    color: "border-shelvitas-green text-shelvitas-green",
  },
  {
    id: "reading",
    label: "Currently Reading",
    icon: BookOpen,
    color: "border-shelvitas-yellow text-shelvitas-yellow",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    color: "border-shelvitas-orange text-shelvitas-orange",
  },
  {
    id: "shelves",
    label: "Shelves",
    icon: Library,
    color: "border-shelvitas-green text-shelvitas-green",
  },
  {
    id: "want",
    label: "Want to Read",
    icon: BookMarked,
    color: "border-shelvitas-blue text-shelvitas-blue",
  },
  {
    id: "dnf",
    label: "DNF",
    icon: BookX,
    color: "border-shelvitas-red text-shelvitas-red",
  },
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
  book?: { id: string; slug: string; title: string; coverUrl?: string | null };
  reviewerUsername?: string;
  reviewerAvatarUrl?: string | null;
  reviewerDisplayName?: string;
}

interface UserShelf {
  id: string;
  slug?: string;
  title: string;
  bookCount: number;
  likesCount: number;
  previewCovers?: string[];
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
          activeTab === "want" ||
          activeTab === "dnf"
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
    dnf: "did_not_finish",
  };

  const filteredEntries =
    activeTab === "read" ||
    activeTab === "reading" ||
    activeTab === "want" ||
    activeTab === "dnf"
      ? entries.filter((e) => e.status === statusMap[activeTab])
      : [];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-secondary">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? `border-b-2 ${tab.color}`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-8">
          <PageLoader />
        </div>
      )}

      {/* Book entries (Read / Reading / Want to Read) */}
      {!isLoading &&
        (activeTab === "read" ||
          activeTab === "reading" ||
          activeTab === "want" ||
          activeTab === "dnf") && (
          <div>
            {filteredEntries.length > 0 ? (
              <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8">
                {filteredEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/books/${entry.book.slug ?? entry.book.id}`}
                    className="group cursor-pointer"
                  >
                    <Tooltip
                      content={entry.book.title}
                      side="bottom"
                      className="w-full"
                    >
                      <div className="w-full rounded-sm ring-shelvitas-green transition-all group-hover:ring-2">
                        {entry.book.coverUrl ? (
                          <RemoteImage
                            src={entry.book.coverUrl}
                            alt={entry.book.title}
                            width={44}
                            height={64}
                            className="aspect-[2/3] w-full rounded-sm object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[2/3] w-full items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </Tooltip>
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
                {activeTab === "dnf" &&
                  `${username} hasn't marked any books as DNF.`}
              </p>
            )}
          </div>
        )}

      {/* Reviews */}
      {!isLoading && activeTab === "reviews" && (
        <div>
          {reviews.length > 0 ? (
            <div className="mt-4 divide-y divide-secondary/40">
              {reviews.map((review) => (
                <Link
                  key={review.id}
                  href={
                    review.reviewerUsername && review.book?.slug
                      ? `/${review.reviewerUsername}/book/${review.book.slug}`
                      : `/reviews/${review.id}`
                  }
                  className="group relative flex gap-5 overflow-hidden py-5 transition-colors hover:bg-secondary/5"
                >
                  {/* Decorative quote mark background */}
                  <span className="pointer-events-none absolute -right-4 -top-6 select-none font-serif text-[120px] leading-none text-shelvitas-green/[0.04]">
                    &ldquo;
                  </span>

                  {/* Book cover */}
                  <div className="shrink-0">
                    {review.book?.coverUrl ? (
                      <RemoteImage
                        src={review.book.coverUrl}
                        alt={review.book.title ?? "Book"}
                        width={64}
                        height={96}
                        className="h-28 w-[4.5rem] rounded-sm object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-28 w-[4.5rem] items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Quote card */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-shelvitas-green/70">
                        {review.book?.title ?? "Untitled"}
                      </p>
                      <p className="font-serif text-sm italic leading-relaxed text-foreground/75">
                        <span className="not-italic text-shelvitas-green/60">
                          &ldquo;
                        </span>
                        {review.body}
                        <span className="not-italic text-shelvitas-green/60">
                          &rdquo;
                        </span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        &mdash;
                      </span>
                      {review.reviewerAvatarUrl ? (
                        <RemoteImage
                          src={review.reviewerAvatarUrl}
                          alt={review.reviewerDisplayName ?? username}
                          width={16}
                          height={16}
                          className="h-4 w-4 rounded-full"
                        />
                      ) : (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-semibold">
                          {(review.reviewerDisplayName ?? username)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        @{review.reviewerUsername ?? username}
                      </span>
                    </div>
                  </div>
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
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {shelves.map((shelf) => (
                <Link
                  key={shelf.id}
                  href={`/shelves/${shelf.slug ?? shelf.id}`}
                  className="group"
                >
                  {/* Stacked covers */}
                  <div className="relative mb-3 h-28">
                    {(() => {
                      const covers = shelf.previewCovers ?? [];
                      const placeholderColors = [
                        "bg-emerald-700/40",
                        "bg-amber-700/40",
                        "bg-sky-700/40",
                        "bg-rose-700/40",
                        "bg-violet-700/40",
                        "bg-teal-700/40",
                      ];
                      const slots = Array.from({ length: 4 }).map(
                        (_, i) => covers[i] ?? null,
                      );
                      return slots.map((cover, i) => (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={`${shelf.id}-slot-${i}`}
                          className="absolute top-0 h-28 w-[4.7rem] transition-transform group-hover:translate-x-0.5"
                          style={{ left: `${i * 50}px`, zIndex: 4 - i }}
                        >
                          {cover ? (
                            <RemoteImage
                              src={cover}
                              alt=""
                              width={75}
                              height={112}
                              className="h-full w-full rounded-sm border border-white/10 object-cover"
                            />
                          ) : (
                            <div
                              className={`h-full w-full rounded-sm border border-white/10 ${placeholderColors[(i + shelf.id.charCodeAt(0)) % placeholderColors.length]}`}
                            />
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                  <p className="text-sm font-semibold transition-colors group-hover:text-shelvitas-green">
                    {shelf.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{username} &middot; {shelf.bookCount} book
                    {shelf.bookCount !== 1 ? "s" : ""}
                  </p>
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
