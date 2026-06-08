"use client";

import type { GoalRecord, PostRecord } from "@/components/global/app-data";
import { goals as baseGoals, posts as basePosts } from "@/components/global/app-data";

const GOALS_STORAGE_KEY = "nxt:goals";
const POSTS_STORAGE_KEY = "nxt:posts";
const DELETED_GOALS_KEY = "nxt:deleted-goals";
const DELETED_POSTS_KEY = "nxt:deleted-posts";

type Listener = () => void;

const listeners = new Set<Listener>();

function emitChange() {
  window.dispatchEvent(new Event("nxt-content-storage"));
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  emitChange();
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || `item-${Date.now()}`;
}

function mergeById<T extends { id: string }>(
  baseItems: T[],
  storedItems: T[],
  deletedIds: string[],
) {
  const storedMap = new Map(storedItems.map((item) => [item.id, item]));
  const merged = baseItems
    .filter((item) => !deletedIds.includes(item.id))
    .map((item) => storedMap.get(item.id) ?? item);
  const baseIds = new Set(baseItems.map((item) => item.id));
  const created = storedItems.filter(
    (item) => !baseIds.has(item.id) && !deletedIds.includes(item.id),
  );

  return [...created, ...merged];
}

export function subscribeToContent(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  window.addEventListener("nxt-content-storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener("nxt-content-storage", listener);
  };
}

export function getContentSnapshot() {
  return JSON.stringify({
    goals: getAllGoals(),
    posts: getAllPosts(),
  });
}

export function getContentServerSnapshot() {
  return JSON.stringify({
    goals: baseGoals,
    posts: basePosts,
  });
}

export function getAllGoals() {
  return mergeById(
    baseGoals,
    readJson<GoalRecord[]>(GOALS_STORAGE_KEY, []),
    readJson<string[]>(DELETED_GOALS_KEY, []),
  );
}

export function getAllPosts() {
  return mergeById(
    basePosts,
    readJson<PostRecord[]>(POSTS_STORAGE_KEY, []),
    readJson<string[]>(DELETED_POSTS_KEY, []),
  );
}

export function getGoal(goalId: string) {
  return getAllGoals().find((goal) => goal.id === goalId);
}

export function getPost(postId: string) {
  return getAllPosts().find((post) => post.id === postId);
}

export function saveGoal(goal: Omit<GoalRecord, "id"> & { id?: string }) {
  const stored = readJson<GoalRecord[]>(GOALS_STORAGE_KEY, []);
  const id = goal.id ?? `${slugify(goal.title)}-${Date.now()}`;
  const nextGoal: GoalRecord = { ...goal, id };
  const nextStored = stored.some((item) => item.id === id)
    ? stored.map((item) => (item.id === id ? nextGoal : item))
    : [nextGoal, ...stored];

  writeJson(GOALS_STORAGE_KEY, nextStored);
  return nextGoal;
}

export function savePost(post: Omit<PostRecord, "id"> & { id?: string }) {
  const stored = readJson<PostRecord[]>(POSTS_STORAGE_KEY, []);
  const id = post.id ?? `${slugify(post.title)}-${Date.now()}`;
  const nextPost: PostRecord = { ...post, id };
  const nextStored = stored.some((item) => item.id === id)
    ? stored.map((item) => (item.id === id ? nextPost : item))
    : [nextPost, ...stored];

  writeJson(POSTS_STORAGE_KEY, nextStored);
  return nextPost;
}

export function deleteGoal(goalId: string) {
  const stored = readJson<GoalRecord[]>(GOALS_STORAGE_KEY, []).filter(
    (goal) => goal.id !== goalId,
  );
  const deleted = new Set(readJson<string[]>(DELETED_GOALS_KEY, []));
  deleted.add(goalId);
  window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(stored));
  writeJson(DELETED_GOALS_KEY, [...deleted]);
}

export function deletePost(postId: string) {
  const stored = readJson<PostRecord[]>(POSTS_STORAGE_KEY, []).filter(
    (post) => post.id !== postId,
  );
  const deleted = new Set(readJson<string[]>(DELETED_POSTS_KEY, []));
  deleted.add(postId);
  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(stored));
  writeJson(DELETED_POSTS_KEY, [...deleted]);
}
