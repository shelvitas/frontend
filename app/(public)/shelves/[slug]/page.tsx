import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, BookOpen, Library } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShelfActions } from "@/components/shelf/shelf-actions";
import { CommentThread } from "@/components/review/comment-thread";
import type { ShelfPageData, CommentData } from "@/lib/types";

import { serverFetch, SERVER_API_URL } from "@/lib/server-fetch";
import { RemoteImage } from "@/components/ui/remote-image";

async function getShelf(idOrSlug: string) {
  return serverFetch<ShelfPageData>(`/v1/shelves/${idOrSlug}`);
}

async function getComments(shelfIdOrSlug: string): Promise<CommentData[]> {
  try {
    const res = await fetch(
      `${SERVER_API_URL}/v1/shelves/${shelfIdOrSlug}/comments?limit=50`,
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shelf = await getShelf(slug);

  if (!shelf) return { title: "Shelf not found" };

  return {
    title: shelf.title,
    description:
      shelf.description ?? `A shelf of ${shelf.bookCount} books on Shelvitas`,
    openGraph: {
      title: shelf.title,
      description: shelf.description ?? `${shelf.bookCount} books`,
      type: "website",
    },
  };
}

const ShelfPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const [shelf, shelfComments] = await Promise.all([
    getShelf(slug),
    getComments(slug),
  ]);

  if (!shelf) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container flex max-w-3xl flex-1 flex-col py-10">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5 text-shelvitas-green" />
              <h1 className="text-2xl font-bold">{shelf.title}</h1>
              {shelf.isPrivate && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {shelf.description && (
              <p className="mt-2 text-sm text-foreground/80">
                {shelf.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {shelf.bookCount} book{shelf.bookCount !== 1 ? "s" : ""}
              </span>
              {shelf.isRanked && <span>Ranked</span>}
              <span>
                {shelf.likesCount} like{shelf.likesCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* % read badge */}
          {shelf.percentRead !== null && (
            <div className="flex flex-col items-center rounded-sm bg-secondary px-3 py-2">
              <span className="text-lg font-bold text-shelvitas-green">
                {shelf.percentRead}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                read
              </span>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="mt-4 border-t border-secondary pt-4">
          <ShelfActions
            shelfId={shelf.id}
            shelfSlug={shelf.slug}
            initialLikes={shelf.likesCount}
            initialIsLiked={shelf.isLiked}
            shelfTitle={shelf.title}
          />
        </div>

        {/* ── Book Grid ── */}
        {shelf.books.length > 0 ? (
          <div className="mt-6 space-y-3">
            {shelf.books.map((book, index) => (
              <div
                key={book.id}
                className="flex items-center gap-4 rounded-sm border border-secondary p-3"
              >
                {/* Rank number */}
                {shelf.isRanked && (
                  <span className="w-8 text-center text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                )}

                {/* Cover */}
                <Link
                  href={`/books/${book.bookSlug ?? book.bookId}`}
                  className="shrink-0"
                >
                  {book.coverUrl ? (
                    <RemoteImage
                      src={book.coverUrl}
                      alt={book.title}
                      width={56}
                      height={80}
                      className="h-20 w-14 rounded-sm object-cover transition-opacity hover:opacity-80"
                    />
                  ) : (
                    <div className="flex h-20 w-14 items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
                      No cover
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/books/${book.bookSlug ?? book.bookId}`}
                    className="text-sm font-medium hover:text-shelvitas-green"
                  >
                    {book.title}
                  </Link>
                  {book.notes && (
                    <p className="mt-1 text-xs text-foreground/70">
                      {book.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">This shelf is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Books added to this shelf will appear here.
            </p>
          </div>
        )}

        {/* ── Comments ── */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Comments
          </h2>
          <div className="mt-4">
            <CommentThread shelfId={shelf.id} comments={shelfComments} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShelfPage;
