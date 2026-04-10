"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Search, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { RemoteImage } from "@/components/ui/remote-image";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/hooks/use-auth";
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

const CompleteProfilePage = () => {
  const { registerProfile, user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || "",
  );
  const [favourites, setFavourites] = useState<(FavBook | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
          `/v1/books/search?q=${encodeURIComponent(query)}&per_page=6`,
        );
        // Hide books already picked in other slots
        const pickedIds = new Set(
          favourites.filter((b) => b !== null).map((b) => b!.id),
        );
        setResults(data.results.filter((b) => !pickedIds.has(b.id)));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, editingSlot, favourites]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    setStep(2);
  };

  const selectBook = (book: SearchResult) => {
    if (editingSlot === null) return;
    const updated = [...favourites];
    updated[editingSlot] = {
      id: book.id,
      title: book.title,
      coverUrl: book.coverUrl ?? null,
    };
    setFavourites(updated);
    setEditingSlot(null);
    setQuery("");
    setResults([]);
  };

  const removeBook = (slot: number) => {
    const updated = [...favourites];
    updated[slot] = null;
    setFavourites(updated);
  };

  const allFavouritesSelected = favourites.every((b) => b !== null);

  const handleFinish = async () => {
    if (!allFavouritesSelected) return;
    setError(null);
    setIsLoading(true);
    try {
      await registerProfile(username, displayName, {
        favouriteBook1Id: favourites[0]!.id,
        favouriteBook2Id: favourites[1]!.id,
        favouriteBook3Id: favourites[2]!.id,
        favouriteBook4Id: favourites[3]!.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {step === 1 ? "Set up your profile" : "Pick your top 4 books"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1
            ? "Choose a username and display name"
            : "These will appear on your profile forever — choose wisely"}
        </p>
        {/* Step indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div
            className={`h-1 w-8 rounded-full ${step >= 1 ? "bg-shelvitas-green" : "bg-secondary"}`}
          />
          <div
            className={`h-1 w-8 rounded-full ${step >= 2 ? "bg-shelvitas-green" : "bg-secondary"}`}
          />
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div className="space-y-1.5">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="username"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="e.g. booklover42"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                )
              }
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              className="border-secondary bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Letters, numbers, hyphens, and underscores only
            </p>
          </div>

          <div className="space-y-1.5">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="displayName"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Display name
            </label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={100}
              autoComplete="name"
              className="border-secondary bg-secondary/50"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
          >
            Next
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {/* 4 slots */}
          <div className="grid grid-cols-4 gap-3">
            {favourites.map((book, i) => (
              <div
                key={`fav-${book?.id ?? `empty-${i}`}`}
                className="group relative"
              >
                {book ? (
                  <>
                    <Tooltip content={book.title} side="bottom" className="w-full">
                      <div className="rounded-sm ring-shelvitas-green transition-all group-hover:ring-2">
                        {book.coverUrl ? (
                          <RemoteImage
                            src={book.coverUrl}
                            alt={book.title}
                            width={70}
                            height={105}
                            className="aspect-[2/3] w-full rounded-sm object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[2/3] w-full items-center justify-center rounded-sm bg-secondary p-1 text-center text-[9px] text-muted-foreground">
                            {book.title.slice(0, 30)}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => removeBook(i)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove"
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
                    className={`flex aspect-[2/3] w-full items-center justify-center rounded-sm border border-dashed transition-colors ${
                      editingSlot === i
                        ? "border-shelvitas-green bg-shelvitas-green/10"
                        : "border-secondary bg-secondary/10 hover:border-shelvitas-green/50 hover:bg-secondary/20"
                    }`}
                    aria-label={`Add book ${i + 1}`}
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Search panel */}
          {editingSlot !== null && (
            <div className="rounded-sm border border-secondary bg-secondary/10 p-3">
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
                <div className="mt-2 max-h-72 space-y-1 overflow-y-auto">
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

              {!searching && query.trim() && results.length === 0 && (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  No books found
                </p>
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

          {error && <p className="text-sm text-red-500">{error}</p>}

          <p className="text-center text-xs text-muted-foreground">
            {favourites.filter((b) => b !== null).length} of 4 selected
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleFinish}
              disabled={!allFavouritesSelected || isLoading}
              className="flex-1 gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Spinner /> Creating profile...
                </>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteProfilePage;
