"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Library, BookOpen, Heart, Lock } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageLoader } from "@/components/ui/page-loader";
import { CreateShelfModal } from "@/components/shelf/create-shelf-modal";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface Shelf {
  id: string;
  title: string;
  description: string | null;
  isPrivate: boolean;
  isRanked: boolean;
  bookCount: number;
  likesCount: number;
  createdAt: string;
}

const ShelvesPage = () => {
  const { session } = useAuthStore();
  const [userShelves, setUserShelves] = useState<Shelf[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShelves = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const data = await api.get<Shelf[]>("/v1/shelves");
      setUserShelves(data);
    } catch {
      // handle silently
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container flex max-w-2xl flex-1 flex-col py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-shelvitas-green" />
            <h1 className="text-2xl font-bold">Shelves</h1>
          </div>
          <CreateShelfModal onSaved={() => fetchShelves()} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Curate books for yourself or share with others.
        </p>

        {isLoading && <PageLoader />}

        {!isLoading && userShelves.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <Library className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No shelves yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a shelf to start curating books.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          {userShelves.map((shelf) => (
            <Link
              key={shelf.id}
              href={`/shelves/${shelf.id}`}
              className="flex items-center gap-3 rounded-sm border border-secondary p-3 transition-colors hover:bg-secondary/30"
            >
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{shelf.title}</p>
                  {shelf.isPrivate && (
                    <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                  {shelf.isRanked && (
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                      Ranked
                    </span>
                  )}
                </div>
                {shelf.description && (
                  <p className="truncate text-xs text-muted-foreground">{shelf.description}</p>
                )}
                <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>
                    {shelf.bookCount} book{shelf.bookCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {shelf.likesCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShelvesPage;
