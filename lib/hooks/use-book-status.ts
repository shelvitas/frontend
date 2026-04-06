"use client";

import { useState, useEffect } from "react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

type ReadingStatus = "want_to_read" | "currently_reading" | "read" | "did_not_finish" | null;

interface BookStatus {
  status: ReadingStatus;
  rating: string | null;
  currentPage: number | null;
  currentPercent: number | null;
}

export function useBookStatus(bookId: string) {
  const session = useAuthStore((s) => s.session);
  const [data, setData] = useState<BookStatus | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!session) {
      setIsHydrated(true);
      return;
    }

    api
      .get<BookStatus | null>(`/v1/books/${bookId}/status`)
      .then((result) => {
        setData(result);
      })
      .catch(() => {})
      .finally(() => setIsHydrated(true));
  }, [session, bookId]);

  return {
    status: data?.status ?? null,
    rating: data?.rating ?? null,
    currentPage: data?.currentPage ?? null,
    currentPercent: data?.currentPercent ?? null,
    isHydrated,
    isAuthenticated: !!session,
    setStatus: (status: ReadingStatus) => {
      setData((prev) => (prev ? { ...prev, status } : { status, rating: null, currentPage: null, currentPercent: null }));
    },
    setRating: (rating: string | null) => {
      setData((prev) => (prev ? { ...prev, rating } : { status: null, rating, currentPage: null, currentPercent: null }));
    },
    clear: () => setData(null),
  };
}
