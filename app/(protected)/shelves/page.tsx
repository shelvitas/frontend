"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Library, Plus, BookOpen } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/page-loader";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface Shelf {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: string;
}

const ShelvesPage = () => {
  const { session } = useAuthStore();
  const [userShelves, setUserShelves] = useState<Shelf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

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

  const createShelf = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post("/v1/shelves", { name: newName.trim() });
      setNewName("");
      setShowCreate(false);
      fetchShelves();
    } catch {
      // handle silently
    } finally {
      setCreating(false);
    }
  };

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container max-w-2xl flex-1 py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-shelvitas-green" />
            <h1 className="text-2xl font-bold">Shelves</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => setShowCreate(!showCreate)}
          >
            <Plus className="h-3.5 w-3.5" />
            New shelf
          </Button>
        </div>

        {showCreate && (
          <div className="mt-4 flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Shelf name..."
              className="border-secondary bg-secondary/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") createShelf();
              }}
            />
            <Button
              className="gap-1.5 bg-shelvitas-green text-background hover:bg-shelvitas-green/90"
              onClick={createShelf}
              disabled={creating}
            >
              {creating ? <Spinner className="h-3.5 w-3.5" /> : "Create"}
            </Button>
          </div>
        )}

        {isLoading && <PageLoader />}

        {!isLoading && userShelves.length === 0 && (
          <div className="mt-16 text-center">
            <Library className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No shelves yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create shelves to organize your books.
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
              <div className="flex-1">
                <p className="text-sm font-medium">{shelf.name}</p>
                {shelf.description && (
                  <p className="text-xs text-muted-foreground">
                    {shelf.description}
                  </p>
                )}
              </div>
              {shelf.isPrivate && (
                <span className="text-[10px] text-muted-foreground">
                  Private
                </span>
              )}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShelvesPage;
