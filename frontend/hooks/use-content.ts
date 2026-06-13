"use client";

import { useSyncExternalStore } from "react";

import {
  getContentServerSnapshot,
  getContentSnapshot,
  subscribeToContent,
} from "@/lib/content-storage";

export function useContent() {
  const snapshot = useSyncExternalStore(
    subscribeToContent,
    getContentSnapshot,
    getContentServerSnapshot,
  );
  const content = JSON.parse(snapshot) as {
    goals: import("@/components/global/app-data").GoalRecord[];
    posts: import("@/components/global/app-data").PostRecord[];
  };

  return content;
}
