"use client";

import { useState } from "react";
import {
  BookMarked,
  BookOpen,
  BookCheck,
  BookX,
  Lock,
  Unlock,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { StarRating } from "@/components/book/star-rating";
import { TagsInput } from "@/components/book/tags-input";
import { api } from "@/lib/api";
import { RemoteImage } from "@/components/ui/remote-image";

type ReadingStatus =
  | "want_to_read"
  | "currently_reading"
  | "read"
  | "did_not_finish";

interface DiaryEntry {
  id: string;
  bookId: string;
  status: ReadingStatus;
  rating: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  format: string | null;
  edition: string | null;
  tags: string[] | null;
  privateNotes: string | null;
  isReread: boolean;
}

interface LogModalProps {
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string | null;
  existingEntry?: DiaryEntry | null;
  trigger?: React.ReactNode;
  onSaved?: () => void;
}

const statusOptions = [
  {
    value: "want_to_read" as const,
    label: "Want to Read",
    icon: BookMarked,
    color: "text-shelvitas-blue",
  },
  {
    value: "currently_reading" as const,
    label: "Reading",
    icon: BookOpen,
    color: "text-shelvitas-yellow",
  },
  {
    value: "read" as const,
    label: "Read",
    icon: BookCheck,
    color: "text-shelvitas-green",
  },
  {
    value: "did_not_finish" as const,
    label: "DNF",
    icon: BookX,
    color: "text-shelvitas-red",
  },
];

const formatOptions = [
  { value: "", label: "Select format..." },
  { value: "physical", label: "Physical" },
  { value: "ebook", label: "eBook" },
  { value: "audiobook", label: "Audiobook" },
  { value: "borrowed", label: "Borrowed" },
];

function toDateInput(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export const LogModal = ({
  bookId,
  bookTitle,
  bookCoverUrl,
  existingEntry,
  trigger,
  onSaved,
}: LogModalProps) => {
  const isEdit = !!existingEntry;
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [status, setStatus] = useState<ReadingStatus>(
    existingEntry?.status ?? "read",
  );
  const [rating, setRating] = useState<number | null>(
    existingEntry?.rating ? parseFloat(existingEntry.rating) : null,
  );
  const [startedAt, setStartedAt] = useState(
    toDateInput(existingEntry?.startedAt ?? null),
  );
  const [finishedAt, setFinishedAt] = useState(
    toDateInput(existingEntry?.finishedAt ?? null),
  );
  const [format, setFormat] = useState(existingEntry?.format ?? "");
  const [edition, setEdition] = useState(existingEntry?.edition ?? "");
  const [tags, setTags] = useState<string[]>(existingEntry?.tags ?? []);
  const [reviewText, setReviewText] = useState("");
  const [privateNotes, setPrivateNotes] = useState(
    existingEntry?.privateNotes ?? "",
  );
  const [showPrivateNotes, setShowPrivateNotes] = useState(
    !!existingEntry?.privateNotes,
  );
  const [isReread, setIsReread] = useState(existingEntry?.isReread ?? false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        status,
        ...(rating !== null && { rating }),
        ...(startedAt && { startedAt: new Date(startedAt).toISOString() }),
        ...(finishedAt && { finishedAt: new Date(finishedAt).toISOString() }),
        ...(format && { format }),
        ...(edition && { edition }),
        ...(tags.length > 0 && { tags }),
        ...(privateNotes && { privateNotes }),
        isReread,
      };

      if (isEdit && existingEntry) {
        await api.patch(`/v1/diary/${existingEntry.id}`, payload);
      } else {
        await api.post("/v1/diary", { ...payload, bookId });
      }

      setOpen(false);
      toast(isEdit ? "Entry updated" : "Book logged!");
      onSaved?.();
    } catch (err) {
      toast("Failed to save", "error");
      setError(
        err instanceof Error ? err.message : "Failed to save diary entry",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="sm"
            className="bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
          >
            {isEdit ? "Edit Log" : "Log / Review"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <BookMarked className="h-4 w-4 text-shelvitas-green" />
            {isEdit ? "Edit Entry" : "Log Book"}
          </DialogTitle>
        </DialogHeader>

        {/* Book strip */}
        <div className="flex items-center gap-3 rounded-sm bg-secondary/30 px-3 py-2.5">
          {bookCoverUrl ? (
            <RemoteImage
              src={bookCoverUrl}
              alt={bookTitle}
              width={44}
              height={64}
              className="h-16 w-11 shrink-0 rounded-sm object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-sm bg-secondary text-[10px]">
              <BookMarked className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <p className="text-sm font-medium text-shelvitas-green">
            {bookTitle}
          </p>
        </div>

        <div className="space-y-5">
          {/* Status */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <div className="flex gap-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={status === opt.value ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 gap-1 text-xs ${
                      status === opt.value ? `bg-secondary ${opt.color}` : ""
                    }`}
                    onClick={() => setStatus(opt.value)}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${status === opt.value ? opt.color : ""}`}
                    />
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rating
            </p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="started-at"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Started
              </label>
              <Input
                id="started-at"
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="border-secondary bg-secondary/50 text-xs"
              />
            </div>
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="finished-at"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Finished
              </label>
              <Input
                id="finished-at"
                type="date"
                value={finishedAt}
                onChange={(e) => setFinishedAt(e.target.value)}
                className="border-secondary bg-secondary/50 text-xs"
              />
            </div>
          </div>

          {/* Format + Edition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="format"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Format
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-xs text-foreground"
              >
                {formatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="edition"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Edition
              </label>
              <Input
                id="edition"
                type="text"
                placeholder="e.g. Hardcover, 1st"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                className="border-secondary bg-secondary/50 text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tags
            </p>
            <TagsInput
              value={tags}
              onChange={setTags}
              placeholder="e.g. fantasy, book-club"
            />
          </div>

          {/* Review */}
          {!isEdit && (
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="review"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Review (optional)
              </label>
              <textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think?"
                rows={4}
                className="w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}

          {/* Private Notes Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowPrivateNotes(!showPrivateNotes)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {showPrivateNotes ? (
                <Unlock className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {showPrivateNotes ? "Hide" : "Show"} private notes
            </button>
            {showPrivateNotes && (
              <textarea
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                placeholder="Only visible to you..."
                rows={3}
                className="mt-2 w-full rounded-sm border border-secondary bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            )}
          </div>

          {/* Reread checkbox */}
          <Checkbox
            checked={isReread}
            onChange={setIsReread}
            label="This is a reread"
          />

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
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
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading && <Spinner />}
              {isLoading && "Saving..."}
              {!isLoading && isEdit && "Save Changes"}
              {!isLoading && !isEdit && "Log Book"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
