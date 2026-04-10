"use client";

import { useQuery } from "@tanstack/react-query";
import { PageLoader } from "@/components/ui/page-loader";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${API_URL}/v1/books`);
  if (!res.ok) throw new Error("Failed to fetch books");
  const json = await res.json();
  return json.data;
}

const TestingPage = () => {
  const {
    data: books,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl space-y-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Testing</h1>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">Books</h2>

          {isLoading && <PageLoader />}
          {error && <p className="text-red-500">Error loading books.</p>}

          {books && books.length > 0 && (
            <div className="grid gap-3">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="rounded-lg border border-border bg-card p-4 text-left"
                >
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {book.author} &middot; {book.genre} &middot; {book.year}
                  </p>
                </div>
              ))}
            </div>
          )}

          {books && books.length === 0 && (
            <p className="text-muted-foreground">No books found.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default TestingPage;
