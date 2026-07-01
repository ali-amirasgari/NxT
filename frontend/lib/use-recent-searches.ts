"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nxt.recent-searches";
const MAX_ITEMS = 8;

function readStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeStorage(items: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors (private mode, quota, etc).
  }
}

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setItems((current) => {
      const next = [
        trimmed,
        ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_ITEMS);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeSearch = useCallback((term: string) => {
    setItems((current) => {
      const next = current.filter((item) => item !== term);
      writeStorage(next);
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setItems([]);
    writeStorage([]);
  }, []);

  return { items, addSearch, removeSearch, clearSearches };
}
