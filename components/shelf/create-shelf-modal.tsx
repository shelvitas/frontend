"use client";

import { useState } from "react";
import { Library } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface CreateShelfModalProps {
  trigger?: React.ReactNode;
  onSaved?: (shelfId: string) => void;
}

export const CreateShelfModal = ({
  trigger,
  onSaved,
}: CreateShelfModalProps) => {
  const session = useAuthStore((s) => s.session);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRanked, setIsRanked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const shelf = await api.post<{ id: string; slug?: string }>("/v1/shelves", {
        title: title.trim(),
        description: description.trim() || undefined,
        isRanked,
        isPrivate,
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setIsRanked(false);
      setIsPrivate(false);
      toast("Shelf created!");
      if (onSaved) {
        onSaved(shelf.id);
      } else {
        window.location.href = `/shelves/${shelf.slug ?? shelf.id}`;
      }
    } catch (err) {
      toast("Failed to create shelf", "error");
      setError(err instanceof Error ? err.message : "Failed to create shelf");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (!session && isOpen) {
      window.location.href = "/sign-in";
      return;
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="sm"
            className="gap-1.5 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
          >
            <Library className="h-3.5 w-3.5" />
            Create shelf
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-shelvitas-green/10">
              <Library className="h-5 w-5 text-shelvitas-green" />
            </div>
            <div>
              <DialogTitle>Create a Shelf</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Curate books for yourself or share with others
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 border-t border-secondary/40 pt-4">
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="shelf-modal-title"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Title
            </label>
            <Input
              id="shelf-modal-title"
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
              rows={2}
              placeholder="What's this shelf about?"
              className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex gap-4">
            <Checkbox
              checked={isRanked}
              onChange={setIsRanked}
              label="Ranked"
            />
            <Checkbox
              checked={isPrivate}
              onChange={setIsPrivate}
              label="Private"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
              onClick={handleCreate}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                "Create shelf"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
