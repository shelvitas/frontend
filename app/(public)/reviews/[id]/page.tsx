/**
 * Legacy review URL — /reviews/{uuid}
 *
 * The canonical URL is now /{username}/book/{bookSlug}. We keep this route
 * alive so existing inbound links don't 404, but it does a permanent
 * server-side redirect to the canonical address. Next.js's `permanentRedirect`
 * sends a 308 (which most crawlers and browsers treat the same as 301).
 *
 * The lookup goes via the legacy /v1/reviews/:id endpoint which is still
 * supported for backwards compatibility, then we resolve the username + book
 * slug from the joined response and redirect.
 */
import { notFound, permanentRedirect } from "next/navigation";

import { serverFetch } from "@/lib/server-fetch";

interface LegacyReviewLookup {
  id: string;
  reviewer: { username: string };
  // The legacy endpoint may not include the book slug — fall back to a
  // separate fetch if needed
  bookId?: string;
  book?: { slug: string };
}

const LegacyReviewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const review = await serverFetch<LegacyReviewLookup>(`/v1/reviews/${id}`);

  if (!review) notFound();

  // The /v1/reviews/:id endpoint may not include book.slug. If it doesn't, we
  // resolve it via a second hop on /v1/books/:bookId. This is the only way to
  // build the canonical URL from a legacy UUID-only review.
  let bookSlug = review.book?.slug;
  if (!bookSlug && review.bookId) {
    const book = await serverFetch<{ slug: string }>(`/v1/books/${review.bookId}`);
    bookSlug = book?.slug;
  }

  if (!bookSlug) notFound();

  permanentRedirect(`/${review.reviewer.username}/book/${bookSlug}`);
};

export default LegacyReviewPage;
