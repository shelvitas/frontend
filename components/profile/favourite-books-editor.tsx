"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Search } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { RemoteImage } from "@/components/ui/remote-image";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api";

interface FavBook {
  id: string;
  title: string;
  coverUrl: string | null;
}

interface SearchResult {
  id: string;
  title: string;
  coverUrl?: string | null;
  authors?: { name: string }[];
}

interface FavouriteBooksEditorProps {
  username: string;
  initialBooks: FavBook[];
  onUpdate?: () => void;
}

export const FavouriteBooksEditor = ({
  username,
  initialBooks,
  onUpdate,
}: FavouriteBooksEditorProps) => {
  const { toast } = useToast();
  const [books, setBooks] = useState<(FavBook | null)[]>(() => {
    const slots: (FavBook | null)[] = [...initialBooks];
    while (slots.length < 4) slots.push(null);
    return slots.slice(0, 4);
  });
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!query.trim() || editingSlot === null) {
      setResults([]);
      return undefined;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.get<{ results: SearchResult[] }>(
          `/v1/books/search?q=${encodeURIComponent(query)}&per_page=5`,
        );
        setResults(data.results);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, editingSlot]);

  const saveSlots = async (updated: (FavBook | null)[]) => {
    try {
      await api.patch(`/v1/profile/${username}`, {
        favouriteBook1Id: updated[0]?.id ?? null,
        favouriteBook2Id: updated[1]?.id ?? null,
        favouriteBook3Id: updated[2]?.id ?? null,
        favouriteBook4Id: updated[3]?.id ?? null,
      });
      toast("Favourites updated");
      onUpdate?.();
    } catch {
      toast("Failed to update favourites", "error");
    }
  };

  const selectBook = (book: SearchResult) => {
    if (editingSlot === null) return;
    const updated = [...books];
    updated[editingSlot] = {
      id: book.id,
      title: book.title,
      coverUrl: book.coverUrl ?? null,
    };
    setBooks(updated);
    setEditingSlot(null);
    setQuery("");
    setResults([]);
    saveSlots(updated);
  };

  const removeBook = (slot: number) => {
    const updated = [...books];
    updated[slot] = null;
    setBooks(updated);
    saveSlots(updated);
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {books.map((book, i) => (
          <div key={`fav-slot-${book?.id ?? i}`} className="group relative">
            {book ? (
              <>
                <Link href={`/books/${book.id}`}>
                  {book.coverUrl ? (
                    <RemoteImage
                      src={book.coverUrl}
                      alt={book.title}
                      width={44}
                      height={64}
                      className="aspect-[2/3] w-full rounded-sm object-cover transition-opacity group-hover:opacity-80"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-sm bg-secondary text-[10px] text-muted-foreground">
                      {book.title.slice(0, 20)}
                    </div>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => removeBook(i)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingSlot(i);
                  setQuery("");
                  setResults([]);
                }}
                className="flex aspect-[2/3] w-full items-center justify-center rounded-sm border border-dashed border-secondary bg-secondary/10 transition-colors hover:border-shelvitas-green/50 hover:bg-secondary/20"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Search panel */}
      {editingSlot !== null && (
        <div className="mt-3 rounded-sm border border-secondary bg-secondary/10 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a book..."
              className="border-secondary bg-secondary/30 pl-8 text-xs"
              autoFocus
            />
            {searching && (
              <Spinner className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-2 space-y-1">
              {results.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => selectBook(book)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary/30"
                >
                  {book.coverUrl ? (
                    <RemoteImage
                      src={book.coverUrl}
                      alt={book.title}
                      width={24}
                      height={36}
                      className="h-9 w-6 shrink-0 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-6 shrink-0 items-center justify-center rounded-sm bg-secondary text-[8px]">
                      ?
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{book.title}</p>
                    {book.authors && book.authors.length > 0 && (
                      <p className="truncate text-muted-foreground">
                        {book.authors.map((a) => a.name).join(", ")}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingSlot(null);
              setQuery("");
              setResults([]);
            }}
            className="mt-2 text-[10px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
