"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { StarRating } from "@/components/book/star-rating";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { RemoteImage } from "@/components/ui/remote-image";

interface WriteReviewModalProps {
  bookId: string;
  bookSlug?: string;
  bookTitle: string;
  bookCoverUrl?: string | null;
  trigger?: React.ReactNode;
  onSaved?: (reviewId: string) => void;
}

export const WriteReviewModal = ({
  bookId,
  bookSlug,
  bookTitle,
  bookCoverUrl,
  trigger,
  onSaved,
}: WriteReviewModalProps) => {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const review = await api.post<{ id: string }>("/v1/reviews", {
        bookId,
        body: body.trim(),
        containsSpoilers,
        ...(rating !== null && { rating }),
      });
      setOpen(false);
      setBody("");
      setRating(null);
      setContainsSpoilers(false);
      toast("Review published!");
      if (onSaved) {
        onSaved(review.id);
      } else if (profile?.username && bookSlug) {
        // Canonical URL: /{username}/book/{book-slug}
        window.location.href = `/${profile.username}/book/${bookSlug}`;
      } else {
        // Legacy URL — redirects to canonical
        window.location.href = `/reviews/${review.id}`;
      }
    } catch (err) {
      toast("Failed to publish review", "error");
      setError(err instanceof Error ? err.message : "Failed to publish review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (!session && isOpen) {
      window.location.href = "/sign-in";
      return;
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="sm"
            className="gap-1.5 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
          >
            <PenLine className="h-3.5 w-3.5" />
            Write a review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-shelvitas-green" />
            Write a Review
          </DialogTitle>
        </DialogHeader>

        {/* Book strip */}
        <div className="flex items-center gap-3 rounded-sm bg-secondary/30 px-3 py-2.5">
          {bookCoverUrl ? (
            <RemoteImage
              src={bookCoverUrl}
              alt={bookTitle}
              width={44}
              height={64}
              className="h-16 w-11 shrink-0 rounded-sm object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-sm bg-secondary text-[10px]">
              <PenLine className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <p className="text-sm font-medium text-shelvitas-green">
            {bookTitle}
          </p>
        </div>

        <div className="space-y-5">
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
              rows={6}
              placeholder="What did you think of this book?"
              className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <Checkbox
            checked={containsSpoilers}
            onChange={setContainsSpoilers}
            label="This review contains spoilers"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
              onClick={handleSubmit}
              disabled={isSubmitting || !body.trim()}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? (
                <>
                  <Spinner /> Publishing...
                </>
              ) : (
                "Publish review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
