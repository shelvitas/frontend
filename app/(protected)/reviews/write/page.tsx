"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PenLine } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StarRating } from "@/components/book/star-rating";
import { PageLoader } from "@/components/ui/page-loader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const WriteReviewForm = () => {
  const { session } = useAuthStore();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId") ?? "";

  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const handleSubmit = async () => {
    if (!body.trim() || !bookId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const review = await api.post<{ id: string }>("/v1/reviews", {
        bookId,
        body: body.trim(),
        containsSpoilers,
        ...(rating !== null && { rating }),
      });
      window.location.href = `/reviews/${review.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create review");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container max-w-2xl flex-1 py-10">
        <div className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-shelvitas-green" />
          <h1 className="text-2xl font-bold">Write a Review</h1>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rating
            </p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Review
            </p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="What did you think of this book?"
              className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
              className="rounded border-secondary"
            />
            This review contains spoilers
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
            onClick={handleSubmit}
            disabled={isSubmitting || !body.trim()}
          >
            {isSubmitting ? <Spinner /> : <PenLine className="h-4 w-4" />}
            {isSubmitting ? "Publishing..." : "Publish review"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const WriteReviewPage = () => (
  <Suspense fallback={<PageLoader />}>
    <WriteReviewForm />
  </Suspense>
);

export default WriteReviewPage;
