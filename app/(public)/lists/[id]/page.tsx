import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, BookOpen, List } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ListActions } from "@/components/list/list-actions";
import { CommentThread } from "@/components/review/comment-thread";
import type { ListPageData, CommentData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getList(id: string): Promise<ListPageData | null> {
  try {
    const res = await fetch(`${API_URL}/v1/lists/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ListPageData;
  } catch {
    return null;
  }
}

async function getComments(listId: string): Promise<CommentData[]> {
  try {
    const res = await fetch(`${API_URL}/v1/lists/${listId}/comments?limit=50`, {
      next: { revalidate: 30 },
    });
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
  const list = await getList(id);

  if (!list) return { title: "List not found" };

  return {
    title: list.title,
    description: list.description ?? `A list of ${list.bookCount} books on Shelvitas`,
    openGraph: {
      title: list.title,
      description: list.description ?? `${list.bookCount} books`,
      type: "website",
    },
  };
}

const ListPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [list, listComments] = await Promise.all([getList(id), getComments(id)]);

  if (!list) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container max-w-3xl flex-1 py-10">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-shelvitas-green" />
              <h1 className="text-2xl font-bold">{list.title}</h1>
              {list.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            {list.description && (
              <p className="mt-2 text-sm text-foreground/80">{list.description}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{list.bookCount} book{list.bookCount !== 1 ? "s" : ""}</span>
              {list.isRanked && <span>Ranked</span>}
              <span>{list.likesCount} like{list.likesCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* % read badge */}
          {list.percentRead !== null && (
            <div className="flex flex-col items-center rounded-sm bg-secondary px-3 py-2">
              <span className="text-lg font-bold text-shelvitas-green">
                {list.percentRead}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                read
              </span>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="mt-4 border-t border-secondary pt-4">
          <ListActions
            listId={list.id}
            initialLikes={list.likesCount}
            initialIsLiked={list.isLiked}
            listTitle={list.title}
          />
        </div>

        {/* ── Book Grid ── */}
        {list.books.length > 0 ? (
          <div className="mt-6 space-y-3">
            {list.books.map((book, index) => (
              <div
                key={book.id}
                className="flex items-center gap-4 rounded-sm border border-secondary p-3"
              >
                {/* Rank number */}
                {list.isRanked && (
                  <span className="w-8 text-center text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                )}

                {/* Cover */}
                <Link href={`/books/${book.bookId}`} className="shrink-0">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="h-20 w-14 rounded-sm object-cover transition-opacity hover:opacity-80"
                    />
                  ) : (
                    <div className="flex h-20 w-14 items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
                      No cover
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/books/${book.bookId}`}
                    className="text-sm font-medium hover:text-shelvitas-green"
                  >
                    {book.title}
                  </Link>
                  {book.notes && (
                    <p className="mt-1 text-xs text-foreground/70">{book.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">This list is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Books added to this list will appear here.
            </p>
          </div>
        )}

        {/* ── Comments ── */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Comments
          </h2>
          <div className="mt-4">
            <CommentThread listId={list.id} comments={listComments} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListPage;
