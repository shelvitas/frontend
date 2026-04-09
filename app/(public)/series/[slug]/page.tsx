import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { serverFetch } from "@/lib/server-fetch";
import { RemoteImage } from "@/components/ui/remote-image";

interface SeriesBook {
  id: string;
  slug?: string;
  title: string;
  coverUrl: string | null;
  positionInSeries: string | null;
  publishedDate: string | null;
  avgRating: string | null;
  primaryAuthor: string | null;
  userStatus: { status: string; rating: string | null } | null;
}

interface SeriesPageData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  books: SeriesBook[];
  completionPercent: number | null;
  nextToRead: string | null;
}

async function getSeries(idOrSlug: string) {
  return serverFetch<SeriesPageData>(`/v1/series/${idOrSlug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSeries(slug);
  if (!s) return { title: "Series not found" };
  return {
    title: `${s.name} Series`,
    description:
      s.description ?? `${s.books.length} books in the ${s.name} series`,
  };
}

const SeriesPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex max-w-3xl flex-1 flex-col py-10">
        <h1 className="text-2xl font-bold">{series.name} Series</h1>
        {series.description && (
          <p className="mt-2 text-sm text-foreground/80">
            {series.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{series.books.length} books</span>
          {series.completionPercent !== null && (
            <span className="text-shelvitas-green">
              {series.completionPercent}% complete
            </span>
          )}
        </div>

        {/* Reading order */}
        <div className="mt-6 space-y-2">
          {series.books.map((book, idx) => {
            const isRead = book.userStatus?.status === "read";
            return (
              <Link
                key={book.id}
                href={`/books/${book.slug ?? book.id}`}
                className={`flex items-center gap-4 rounded-sm border p-3 transition-colors hover:bg-secondary/30 ${
                  isRead ? "border-shelvitas-green/30" : "border-secondary"
                }`}
              >
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {book.positionInSeries ?? idx + 1}
                </span>
                {book.coverUrl ? (
                  <RemoteImage
                    src={book.coverUrl}
                    alt={book.title}
                    width={44}
                    height={64}
                    className="h-16 w-11 rounded-sm object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-11 items-center justify-center rounded-sm bg-secondary">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{book.title}</p>
                  {book.primaryAuthor && (
                    <p className="text-xs text-muted-foreground">
                      {book.primaryAuthor}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {book.publishedDate}
                  </p>
                </div>
                {isRead && (
                  <CheckCircle className="h-4 w-4 shrink-0 text-shelvitas-green" />
                )}
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeriesPage;
