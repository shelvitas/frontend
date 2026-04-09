import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { serverFetch } from "@/lib/server-fetch";
import { RemoteImage } from "@/components/ui/remote-image";

interface AuthorPageData {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
  websiteUrl: string | null;
  followerCount: number;
  bibliography: {
    series: {
      seriesId: string;
      seriesSlug: string;
      seriesName: string;
      books: BookInSeries[];
    }[];
    standalone: BookInSeries[];
  };
  userFollow: { isFollowing: boolean; alertOnNewRelease: boolean } | null;
}

interface BookInSeries {
  id: string;
  slug?: string;
  title: string;
  coverUrl: string | null;
  publishedDate: string | null;
  avgRating: string | null;
  positionInSeries?: string | null;
}

async function getAuthor(idOrSlug: string) {
  return serverFetch<AuthorPageData>(`/v1/authors/${idOrSlug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return { title: "Author not found" };
  return {
    title: author.name,
    description: author.bio?.slice(0, 160) ?? `Books by ${author.name}`,
  };
}

const AuthorPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) notFound();

  const allBooks = [
    ...author.bibliography.standalone,
    ...author.bibliography.series.flatMap((s) => s.books),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex max-w-3xl flex-1 flex-col py-10">
        {/* Header */}
        <div className="flex items-start gap-5">
          {author.photoUrl ? (
            <RemoteImage
              src={author.photoUrl}
              alt={author.name}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-3xl font-bold">
              {author.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{author.name}</h1>
            <p className="text-xs text-muted-foreground">
              {allBooks.length} book{allBooks.length !== 1 ? "s" : ""} &middot;{" "}
              {author.followerCount} follower
              {author.followerCount !== 1 ? "s" : ""}
            </p>
            {author.bio && (
              <p className="mt-2 text-sm text-foreground/80">{author.bio}</p>
            )}
          </div>
        </div>

        {/* Series */}
        {author.bibliography.series.map((s) => (
          <div key={s.seriesId} className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {s.seriesName}
            </h2>
            <div className="mt-3 space-y-2">
              {s.books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug ?? book.id}`}
                  className="flex items-center gap-3 rounded-sm p-2 hover:bg-secondary/30"
                >
                  {book.coverUrl ? (
                    <RemoteImage
                      src={book.coverUrl}
                      alt={book.title}
                      width={44}
                      height={64}
                      className="h-16 w-11 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-11 items-center justify-center rounded-sm bg-secondary text-[10px]">
                      <BookOpen className="h-3 w-3" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {book.positionInSeries
                        ? `#${book.positionInSeries} `
                        : ""}
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {book.publishedDate}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Standalone */}
        {author.bibliography.standalone.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Books
            </h2>
            <div className="mt-3 space-y-2">
              {author.bibliography.standalone.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug ?? book.id}`}
                  className="flex items-center gap-3 rounded-sm p-2 hover:bg-secondary/30"
                >
                  {book.coverUrl ? (
                    <RemoteImage
                      src={book.coverUrl}
                      alt={book.title}
                      width={44}
                      height={64}
                      className="h-16 w-11 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-11 items-center justify-center rounded-sm bg-secondary text-[10px]">
                      <BookOpen className="h-3 w-3" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{book.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {book.publishedDate}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AuthorPage;
