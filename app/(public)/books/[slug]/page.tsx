import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Library, PenLine } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RatingHistogram } from "@/components/book/rating-histogram";
import { StatusControls } from "@/components/book/status-controls";
import { ReviewCard } from "@/components/book/review-card";
import { WriteReviewModal } from "@/components/book/write-review-modal";
import { serverFetch } from "@/lib/server-fetch";
import type { BookPageData } from "@/lib/types";

async function getBookPage(idOrSlug: string) {
  // The API accepts both slug and UUID — slugs are preferred for SEO
  return serverFetch<BookPageData>(`/v1/books/${idOrSlug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookPage(slug);

  if (!book) return { title: "Book not found" };

  const authorNames = book.authors.map((a) => a.name).join(", ");
  const description =
    book.description?.slice(0, 160) || `${book.title} by ${authorNames}`;

  return {
    title: `${book.title} by ${authorNames}`,
    description,
    openGraph: {
      title: book.title,
      description,
      type: "book",
      ...(book.coverUrl && { images: [book.coverUrl] }),
    },
  };
}

const BookPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const book = await getBookPage(slug);

  if (!book) notFound();

  const totalReaders =
    (book.readingStats.want_to_read ?? 0) +
    (book.readingStats.currently_reading ?? 0) +
    (book.readingStats.read ?? 0);

  // Schema.org Book markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    ...(book.isbn13 && { isbn: book.isbn13 }),
    ...(book.description && { description: book.description }),
    ...(book.coverUrl && { image: book.coverUrl }),
    ...(book.publisher && {
      publisher: { "@type": "Organization", name: book.publisher },
    }),
    ...(book.publishedDate && { datePublished: book.publishedDate }),
    ...(book.pageCount && { numberOfPages: book.pageCount }),
    ...(book.language && { inLanguage: book.language }),
    author: book.authors.map((a) => ({ "@type": "Person", name: a.name })),
    ...(book.avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: book.avgRating,
        ratingCount: book.ratingsCount,
        bestRating: 5,
        worstRating: 0.5,
      },
    }),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container flex max-w-3xl flex-1 flex-col py-10">
        {/* ── Hero ── */}
        <div className="flex gap-6 sm:gap-8">
          {/* Cover */}
          <div className="shrink-0">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                width={160}
                height={240}
                className="w-28 rounded-sm shadow-xl sm:w-36"
                priority
              />
            ) : (
              <div className="flex h-[168px] w-28 items-center justify-center rounded-sm bg-secondary text-xs text-muted-foreground sm:h-[216px] sm:w-36">
                No cover
              </div>
            )}
          </div>

          {/* Info + Actions */}
          <div className="flex flex-1 flex-col">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {book.subtitle}
              </p>
            )}

            {/* Authors */}
            <div className="mt-1.5 text-sm">
              <span className="text-muted-foreground">by </span>
              {book.authors.map((author, i) => (
                <span key={author.id}>
                  <Link
                    href={`/authors/${author.slug ?? author.id}`}
                    className="font-medium text-shelvitas-green hover:underline"
                  >
                    {author.name}
                  </Link>
                  {i < book.authors.length - 1 && ", "}
                </span>
              ))}
            </div>

            {/* Rating + stats — compact inline */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {book.avgRating && (
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  <Star className="h-4 w-4 fill-shelvitas-orange text-shelvitas-orange" />
                  {book.avgRating.toFixed(1)}
                </span>
              )}
              {book.ratingsCount > 0 && (
                <span>{book.ratingsCount.toLocaleString()} ratings</span>
              )}
              {book.reviewsCount > 0 && (
                <span>{book.reviewsCount.toLocaleString()} reviews</span>
              )}
              {totalReaders > 0 && (
                <span>{totalReaders.toLocaleString()} readers</span>
              )}
            </div>

            {/* Series badge */}
            {book.series && (
              <Link
                href={`/series/${book.series.slug ?? book.series.id}`}
                className="mt-3 inline-flex w-fit items-center gap-1 rounded-sm bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Library className="h-3 w-3" />
                {book.series.name}
                {book.series.position && ` #${book.series.position}`}
                {` (${book.series.totalBooks} books)`}
              </Link>
            )}

            {/* ── Actions: Status + Write Review side by side ── */}
            <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <StatusControls bookId={book.id} />
              </div>
              <WriteReviewModal
                bookId={book.id}
                bookSlug={book.slug}
                bookTitle={book.title}
                bookCoverUrl={book.coverUrl}
                trigger={
                  <button type="button" className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-shelvitas-green/30 bg-shelvitas-green/10 px-4 py-2 text-xs font-semibold text-shelvitas-green transition-colors hover:bg-shelvitas-green/20 sm:w-auto">
                    <PenLine className="h-3.5 w-3.5" />
                    Review
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* ── Meta pills ── */}
        <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          {book.pageCount && (
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5">
              {book.pageCount} pages
            </span>
          )}
          {book.genre && (
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5">
              {book.genre}
            </span>
          )}
          {book.publisher && (
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5">
              {book.publisher}
            </span>
          )}
          {book.publishedDate && (
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5">
              {book.publishedDate}
            </span>
          )}
          {book.isbn13 && (
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5">
              ISBN {book.isbn13}
            </span>
          )}
        </div>

        {/* ── Description ── */}
        {book.description && (
          <p className="mt-6 text-sm leading-relaxed text-foreground/80">
            {book.description}
          </p>
        )}

        {/* ── Community: Rating + Reading Stats side by side ── */}
        {(book.ratingsCount > 0 || totalReaders > 0) && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* Histogram */}
            {book.ratingsCount > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Ratings
                </h2>
                <div className="mt-3">
                  <RatingHistogram
                    histogram={book.ratingHistogram}
                    avgRating={book.avgRating}
                    ratingsCount={book.ratingsCount}
                  />
                </div>
              </div>
            )}

            {/* Reading stats */}
            {totalReaders > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Readers
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { label: "Read", value: book.readingStats.read ?? 0 },
                    {
                      label: "Reading",
                      value: book.readingStats.currently_reading ?? 0,
                    },
                    {
                      label: "Want to Read",
                      value: book.readingStats.want_to_read ?? 0,
                    },
                    {
                      label: "DNF",
                      value: book.readingStats.did_not_finish ?? 0,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-sm bg-secondary/30 px-3 py-2.5 text-center"
                    >
                      <p className="text-lg font-bold">{stat.value}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reviews ── */}
        {book.topReviews.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Reviews
              </h2>
              <WriteReviewModal
                bookId={book.id}
                bookSlug={book.slug}
                bookTitle={book.title}
                bookCoverUrl={book.coverUrl}
                trigger={
                  <button type="button" className="flex items-center gap-1 text-xs font-medium text-shelvitas-green hover:underline">
                    <PenLine className="h-3 w-3" />
                    Write yours
                  </button>
                }
              />
            </div>
            <div className="mt-3 space-y-3">
              {book.topReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BookPage;
