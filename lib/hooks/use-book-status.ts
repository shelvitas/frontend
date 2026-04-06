"use client";

import { useEffect, useCallback, useRef } from "react";
import { create } from "zustand";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

type ReadingStatus =
  | "want_to_read"
  | "currently_reading"
  | "read"
  | "did_not_finish"
  | null;

interface BookStatus {
  status: ReadingStatus;
  rating: string | null;
  currentPage: number | null;
  currentPercent: number | null;
}

interface BookStatusStore {
  statuses: Record<string, BookStatus | null>;
  hydrated: Record<string, boolean>;
  set: (bookId: string, data: BookStatus | null) => void;
  markHydrated: (bookId: string) => void;
}

export const useBookStatusStore = create<BookStatusStore>((set) => ({
  statuses: {},
  hydrated: {},
  set: (bookId, data) =>
    set((s) => ({ statuses: { ...s.statuses, [bookId]: data } })),
  markHydrated: (bookId) =>
    set((s) =>
      s.hydrated[bookId] ? s : { hydrated: { ...s.hydrated, [bookId]: true } },
    ),
}));

// Track in-flight fetches outside Zustand to avoid re-render loops
export const fetchingBooks = new Set<string>();

export function useBookStatus(bookId: string) {
  const session = useAuthStore((s) => s.session);
  const data = useBookStatusStore((s) => s.statuses[bookId] ?? null);
  const isHydrated = useBookStatusStore((s) => !!s.hydrated[bookId]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!session) {
      useBookStatusStore.getState().markHydrated(bookId);
      return;
    }

    if (isHydrated || fetchedRef.current || fetchingBooks.has(bookId)) return;
    fetchedRef.current = true;
    fetchingBooks.add(bookId);

    api
      .get<BookStatus | null>(`/v1/books/${bookId}/status`)
      .then((result) => {
        useBookStatusStore.getState().set(bookId, result);
      })
      .catch(() => {})
      .finally(() => {
        useBookStatusStore.getState().markHydrated(bookId);
        fetchingBooks.delete(bookId);
      });
  }, [session, bookId, isHydrated]);

  const setStatus = useCallback(
    (status: ReadingStatus) => {
      useBookStatusStore.getState().set(bookId, {
        status,
        rating: data?.rating ?? null,
        currentPage: data?.currentPage ?? null,
        currentPercent: data?.currentPercent ?? null,
      });
    },
    [bookId, data],
  );

  const clear = useCallback(() => {
    useBookStatusStore.getState().set(bookId, null);
  }, [bookId]);

  return {
    status: data?.status ?? null,
    rating: data?.rating ?? null,
    currentPage: data?.currentPage ?? null,
    currentPercent: data?.currentPercent ?? null,
    isHydrated,
    isAuthenticated: !!session,
    setStatus,
    clear,
  };
}
