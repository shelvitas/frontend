import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Users, Star, Library } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RatingHistogram } from "@/components/book/rating-histogram";
import { StatusControls } from "@/components/book/status-controls";
import { WantToReadButton } from "@/components/book/want-to-read-button";
import { ReviewCard } from "@/components/book/review-card";
import { WriteReviewModal } from "@/components/book/write-review-modal";
import { serverFetch } from "@/lib/server-fetch";
import type { BookPageData } from "@/lib/types";

async function getBookPage(id: string) {
  return serverFetch<BookPageData>(`/v1/books/${id}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookPage(id);

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

const BookPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const book = await getBookPage(id);

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

      <main className="container max-w-4xl flex-1 py-10">
        {/* ── Hero: Cover + Metadata ── */}
        <div className="flex flex-col gap-8 sm:flex-row">
          {/* Cover */}
          <div className="shrink-0">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                width={96}
                height={144}
                className="w-20 rounded-sm shadow-lg sm:w-24"
                priority
              />
            ) : (
              <div className="flex h-[120px] w-20 items-center justify-center rounded-sm bg-secondary text-xs text-muted-foreground sm:h-36 sm:w-24">
                No cover
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold leading-tight">{book.title}</h1>
            {book.subtitle && (
              <p className="mt-1 text-lg text-muted-foreground">
                {book.subtitle}
              </p>
            )}

            {/* Authors */}
            <div className="mt-2 flex flex-wrap gap-x-2 text-sm">
              <span className="text-muted-foreground">by</span>
              {book.authors.map((author, i) => (
                <span key={author.id}>
                  <Link
                    href={`/authors/${author.id}`}
                    className="font-medium text-shelvitas-green hover:underline"
                  >
                    {author.name}
                  </Link>
                  {i < book.authors.length - 1 && ", "}
                </span>
              ))}
            </div>

            {/* Series badge */}
            {book.series && (
              <Link
                href={`/series/${book.series.id}`}
                className="mt-2 inline-block rounded-sm bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Library className="mr-1 inline h-3 w-3" />
                {book.series.name}
                {book.series.position && ` #${book.series.position}`}
                {` (${book.series.totalBooks} books)`}
              </Link>
            )}

            {/* Quick stats */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              {book.avgRating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-shelvitas-orange text-shelvitas-orange" />
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
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {totalReaders.toLocaleString()} readers
                </span>
              )}
            </div>

            {/* Meta details */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              {book.pageCount && <span>{book.pageCount} pages</span>}
              {book.publisher && <span>{book.publisher}</span>}
              {book.publishedDate && <span>{book.publishedDate}</span>}
              {book.genre && (
                <span className="rounded-sm bg-secondary px-1.5 py-0.5">
                  {book.genre}
                </span>
              )}
              {book.isbn13 && <span>ISBN {book.isbn13}</span>}
            </div>

            {/* Want to Read — primary CTA */}
            <div className="mt-6">
              <WantToReadButton bookId={book.id} />
            </div>

            {/* Status controls */}
            <div className="mt-3">
              <StatusControls bookId={book.id} />
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        {book.description && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {book.description}
            </p>
          </div>
        )}

        {/* ── Rating Histogram ── */}
        {book.ratingsCount > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Community Rating
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

        {/* ── Reading Stats ── */}
        <div className="mt-8 flex items-center justify-around rounded-sm border border-secondary bg-secondary/20 px-4 py-4">
          <div className="text-center">
            <p className="text-lg font-bold">{book.readingStats.read ?? 0}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <BookOpen className="mr-0.5 inline h-3 w-3" />
              Read
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">
              {book.readingStats.currently_reading ?? 0}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Reading
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">
              {book.readingStats.want_to_read ?? 0}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Want to Read
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">
              {book.readingStats.did_not_finish ?? 0}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              DNF
            </p>
          </div>
        </div>

        {/* ── Top Reviews ── */}
        {book.topReviews.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Top Reviews
            </h2>
            <div className="mt-3 space-y-3">
              {book.topReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* ── Authors ── */}
        {book.authors.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              About the Author{book.authors.length > 1 ? "s" : ""}
            </h2>
            <div className="mt-3 space-y-4">
              {book.authors.map((author) => (
                <div key={author.id} className="flex items-start gap-3">
                  {author.photoUrl ? (
                    <img
                      src={author.photoUrl}
                      alt={author.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/authors/${author.id}`}
                      className="font-medium hover:text-shelvitas-green"
                    >
                      {author.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {author.bookCount} book{author.bookCount !== 1 ? "s" : ""}
                    </p>
                    {author.bio && (
                      <p className="mt-1 text-xs text-foreground/70">
                        {author.bio.length > 200
                          ? `${author.bio.slice(0, 200)}...`
                          : author.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ── Write Review CTA ── */}
        <div className="mt-8 rounded-sm border border-dashed border-secondary p-4 text-center">
          <p className="text-sm font-medium">Share your thoughts</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Write a review to help other readers discover this book.
          </p>
          <div className="mt-3">
            <WriteReviewModal
              bookId={book.id}
              bookTitle={book.title}
              bookCoverUrl={book.coverUrl}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookPage;
