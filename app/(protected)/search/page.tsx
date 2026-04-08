"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, X, BookOpen, Users, List, User } from "lucide-react";

import { api } from "@/lib/api";
import { PageLoader } from "@/components/ui/page-loader";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RemoteImage } from "@/components/ui/remote-image";

type SearchTab = "books" | "authors" | "members" | "lists";

interface BookResult {
  id: string;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  isbn13?: string | null;
  genre?: string | null;
  publishedDate?: string | null;
  authors: { id: string; name: string; role: string | null }[];
}

interface SearchResponse {
  results: BookResult[];
  total: number;
  page: number;
  perPage: number;
}

const tabs: { id: SearchTab; label: string; icon: typeof BookOpen }[] = [
  { id: "books", label: "Books", icon: BookOpen },
  { id: "authors", label: "Authors", icon: User },
  { id: "members", label: "Members", icon: Users },
  { id: "lists", label: "Lists", icon: List },
];

const BookResultCard = ({ book }: { book: BookResult }) => {
  const authorNames = book.authors.map((a) => a.name).join(", ");

  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex gap-4 rounded-sm p-3 transition-colors hover:bg-secondary/30"
    >
      {book.coverUrl ? (
        <RemoteImage
          src={book.coverUrl}
          alt={book.title}
          width={64}
          height={96}
          className="h-24 w-16 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-sm bg-secondary">
          <BookOpen className="h-5 w-5 text-muted-foreground/40" />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-semibold transition-colors group-hover:text-shelvitas-green">
          {book.title}
        </p>
        {authorNames && (
          <p className="truncate text-xs text-muted-foreground">
            {authorNames}
          </p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
          {book.publishedDate && <span>{book.publishedDate}</span>}
          {book.genre && <span className="capitalize">{book.genre}</span>}
          {book.isbn13 && <span>ISBN {book.isbn13}</span>}
        </div>
      </div>
    </Link>
  );
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("books");
  const [results, setResults] = useState<BookResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setTotal(0);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        if (activeTab === "books") {
          const data = await api.get<SearchResponse>(
            `/v1/books/search?q=${encodeURIComponent(q.trim())}&per_page=20`,
          );
          setResults(data.results);
          setTotal(data.total);
        } else {
          // Placeholder for other search types
          setResults([]);
          setTotal(0);
        }
      } catch {
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab],
  );

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

  // Re-search when tab changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setTotal(0);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="container flex max-w-3xl flex-1 flex-col py-8">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search books, authors, members, lists..."
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

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b border-secondary">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-shelvitas-green text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && <PageLoader />}

        {/* Book results */}
        {!isLoading && activeTab === "books" && results.length > 0 && (
          <div className="mt-4">
            <p className="mb-3 text-xs text-muted-foreground">
              {total} {total === 1 ? "result" : "results"}
            </p>
            <div className="space-y-1">
              {results.map((book) => (
                <BookResultCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {!isLoading && activeTab !== "books" && hasSearched && (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} search
              coming soon
            </p>
          </div>
        )}

        {/* No results */}
        {!isLoading &&
          hasSearched &&
          activeTab === "books" &&
          results.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
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
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              Search across books, authors, members, and lists
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
