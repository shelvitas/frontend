"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2, BookOpen } from "lucide-react";

import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface BookResult {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  genre?: string | null;
  publisher?: string | null;
  publishedDate?: string | null;
  authors: { id: string; name: string; role: string | null }[];
}

interface SearchResponse {
  results: BookResult[];
  total: number;
  page: number;
  perPage: number;
}

const BookResultCard = ({ book }: { book: BookResult }) => {
  const authorNames = book.authors.map((a) => a.name).join(", ");

  return (
    <div className="group flex gap-4 rounded-sm p-3 transition-colors hover:bg-secondary/30">
      {/* Cover */}
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-24 w-16 flex-shrink-0 rounded-sm object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-24 w-16 flex-shrink-0 items-center justify-center rounded-sm bg-secondary">
          <BookOpen className="h-5 w-5 text-muted-foreground/40" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="truncate text-sm font-semibold transition-colors group-hover:text-shelvitas-green">
          {book.title}
        </p>
        {book.subtitle && (
          <p className="truncate text-xs text-muted-foreground">
            {book.subtitle}
          </p>
        )}
        {authorNames && (
          <p className="truncate text-xs text-muted-foreground">
            {authorNames}
          </p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
          {book.publishedDate && <span>{book.publishedDate}</span>}
          {book.publishedDate && book.genre && <span>&middot;</span>}
          {book.genre && <span className="capitalize">{book.genre}</span>}
          {(book.publishedDate || book.genre) && book.isbn13 && (
            <span>&middot;</span>
          )}
          {book.isbn13 && <span>ISBN {book.isbn13}</span>}
        </div>
        {book.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
            {book.description}
          </p>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await api.get<SearchResponse>(
        `/v1/books/search?q=${encodeURIComponent(q.trim())}&per_page=20`,
      );
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search — triggers 400ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setTotal(0);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container max-w-3xl flex-1 py-8">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 border-secondary bg-secondary/30 pl-11 pr-10 text-base"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="mt-6">
            <p className="mb-4 text-xs text-muted-foreground">
              {total} {total === 1 ? "result" : "results"} for &ldquo;{query}
              &rdquo;
            </p>
            <div className="space-y-1">
              {results.map((book) => (
                <BookResultCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="mt-16 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              No books found for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try a different title, author, or ISBN
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasSearched && (
          <div className="mt-16 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              Search for books by title, author, or ISBN
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Results from our library and Open Library / Google Books
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
