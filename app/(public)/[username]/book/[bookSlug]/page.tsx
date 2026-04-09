/**
 * Canonical review page — /{username}/book/{bookSlug}
 *
 * Letterboxd-style URL that uniquely addresses one user's review of one book.
 * Powered by GET /v1/profile/:username/book/:bookSlug which joins reviews,
 * users, and books on the unique (user_id, book_id) constraint added in
 * migration 0006.
 *
 * The legacy /reviews/[id] route still works (it 301-redirects here).
 */
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, AlertTriangle, BookX, BookOpen } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewActions } from "@/components/review/review-actions";
import { ShareButtons } from "@/components/review/share-buttons";
import { CommentThread } from "@/components/review/comment-thread";
import type { ReviewPageData, CommentData } from "@/lib/types";
import { serverFetch, SERVER_API_URL } from "@/lib/server-fetch";
import { RemoteImage } from "@/components/ui/remote-image";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getReview(username: string, bookSlug: string) {
  return serverFetch<ReviewPageData>(
    `/v1/profile/${username}/book/${bookSlug}`,
  );
}

async function getComments(reviewId: string): Promise<CommentData[]> {
  try {
    const res = await fetch(
      `${SERVER_API_URL}/v1/reviews/${reviewId}/comments?limit=50`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data as CommentData[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; bookSlug: string }>;
}): Promise<Metadata> {
  const { username, bookSlug } = await params;
  const review = await getReview(username, bookSlug);

  if (!review) return { title: "Review not found" };

  const snippet = review.body.slice(0, 140);
  const bookTitle = review.book?.title ?? "a book";
  const title = `${review.reviewer.displayName}'s review of ${bookTitle}`;

  return {
    title,
    description: snippet,
    openGraph: {
      title,
      description: snippet,
      type: "article",
      url: `${APP_URL}/${username}/book/${bookSlug}`,
    },
  };
}

const UserBookReviewPage = async ({
  params,
}: {
  params: Promise<{ username: string; bookSlug: string }>;
}) => {
  const { username, bookSlug } = await params;
  const review = await getReview(username, bookSlug);

  if (!review) notFound();

  const threadedComments = await getComments(review.id);
  const rating = review.rating ? parseFloat(review.rating) : null;
  const reviewUrl = `${APP_URL}/${username}/book/${bookSlug}`;
  const shareText = `${review.reviewer.displayName}'s review of ${review.book?.title ?? "a book"} on Shelvitas`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container flex max-w-3xl flex-1 flex-col py-10">
        {/* ── Book strip ── */}
        {review.book && (
          <Link
            href={`/books/${review.book.slug}`}
            className="flex items-center gap-3 rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/30"
          >
            {review.book.coverUrl ? (
              <RemoteImage
                src={review.book.coverUrl}
                alt={review.book.title}
                width={48}
                height={72}
                className="h-18 w-12 rounded-sm object-cover"
              />
            ) : (
              <div className="h-18 flex w-12 items-center justify-center rounded-sm bg-secondary">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Review of
              </p>
              <p className="text-sm font-medium">{review.book.title}</p>
            </div>
          </Link>
        )}

        {/* ── Reviewer Header ── */}
        <div className="mt-6 flex items-center gap-3">
          {review.reviewer.avatarUrl ? (
            <RemoteImage
              src={review.reviewer.avatarUrl}
              alt={review.reviewer.displayName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-semibold">
              {review.reviewer.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <Link
              href={`/${review.reviewer.username}`}
              className="font-medium hover:text-shelvitas-green"
            >
              {review.reviewer.displayName}
            </Link>
            <p className="text-xs text-muted-foreground">
              @{review.reviewer.username} &middot;{" "}
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* ── Rating + badges ── */}
        <div className="mt-4 flex items-center gap-3">
          {rating !== null && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={`rev-star-${i + 1}`}
                  className={`h-5 w-5 ${
                    i < Math.round(rating)
                      ? "fill-shelvitas-orange text-shelvitas-orange"
                      : "text-secondary"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
          {review.isDnf && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-shelvitas-orange/10 px-2 py-0.5 text-xs font-medium text-shelvitas-orange">
              <BookX className="h-3.5 w-3.5" />
              DNF{review.dnfPage ? ` at page ${review.dnfPage}` : ""}
            </span>
          )}
          {review.containsSpoilers && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              Contains spoilers
            </span>
          )}
        </div>

        {/* ── Review Body ── */}
        <div className="mt-6">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/85">
            {review.body.split("\n").map((paragraph, i) => (
              <p key={`p-${review.id}-${i + 1}`}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* ── Actions: Like, Save, Share ── */}
        <div className="mt-6 flex items-center justify-between border-t border-secondary pt-4">
          <ReviewActions
            reviewId={review.id}
            initialLikes={review.likesCount}
            initialSaves={review.savesCount}
          />
          <ShareButtons url={reviewUrl} text={shareText} />
        </div>

        {/* ── Comment Thread ── */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Comments ({review.commentsCount})
          </h2>
          <div className="mt-4">
            <CommentThread reviewId={review.id} comments={threadedComments} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserBookReviewPage;
