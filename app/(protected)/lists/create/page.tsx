"use client";

import { useState } from "react";
import { List } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const CreateListPage = () => {
  const { session } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRanked, setIsRanked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const list = await api.post<{ id: string }>("/v1/lists", {
        title: title.trim(),
        description: description.trim() || undefined,
        isRanked,
        isPrivate,
      });
      window.location.href = `/lists/${list.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create list");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container max-w-xl flex-1 py-10">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-shelvitas-green" />
          <h1 className="text-2xl font-bold">Create a List</h1>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="list-title"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Title
            </label>
            <Input
              id="list-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best sci-fi of 2024"
              className="border-secondary bg-secondary/50"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's this list about?"
              className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex gap-4">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isRanked}
                onChange={(e) => setIsRanked(e.target.checked)}
                className="rounded border-secondary"
              />
              Ranked list
            </label>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-secondary"
              />
              Private
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            className="gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
            onClick={handleCreate}
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? <Spinner /> : <List className="h-4 w-4" />}
            {isSubmitting ? "Creating..." : "Create list"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateListPage;
