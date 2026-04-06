import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, AlertTriangle, BookX } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewActions } from "@/components/review/review-actions";
import { ShareButtons } from "@/components/review/share-buttons";
import { CommentThread } from "@/components/review/comment-thread";
import type { ReviewPageData, CommentData } from "@/lib/types";

import { serverFetch, SERVER_API_URL } from "@/lib/server-fetch";
import { RemoteImage } from "@/components/ui/remote-image";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getReview(id: string) {
  return serverFetch<ReviewPageData>(`/v1/reviews/${id}`);
}

async function getComments(reviewId: string): Promise<CommentData[]> {
  try {
    const res = await fetch(
      `${SERVER_API_URL}/v1/reviews/${reviewId}/comments?limit=50`,
      { cache: "no-store" },
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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const review = await getReview(id);

  if (!review) return { title: "Review not found" };

  const snippet = review.body.slice(0, 140);
  const title = `Review by ${review.reviewer.displayName}`;

  return {
    title,
    description: snippet,
    openGraph: {
      title,
      description: snippet,
      type: "article",
      url: `${APP_URL}/reviews/${id}`,
    },
  };
}

const ReviewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const [review, threadedComments] = await Promise.all([
    getReview(id),
    getComments(id),
  ]);

  if (!review) notFound();

  const rating = review.rating ? parseFloat(review.rating) : null;
  const reviewUrl = `${APP_URL}/reviews/${id}`;
  const shareText = `Review by ${review.reviewer.displayName} on Shelvitas`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container max-w-3xl flex-1 py-10">
        {/* ── Reviewer Header ── */}
        <div className="flex items-center gap-3">
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

export default ReviewPage;
