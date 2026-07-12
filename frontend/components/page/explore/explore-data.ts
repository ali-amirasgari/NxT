import type { Goal } from "@/apis/types/goal";
import type { Post } from "@/apis/types/social";
import type { User } from "@/apis/types/user";

export type ExploreCategory = string;

export type ExploreTile = {
  id: string;
  label: string;
  category: string;
  media: "image" | "video" | "goal";
  tone: "primary" | "secondary" | "muted" | "card";
  size: "large" | "small" | "wide";
  href: string;
  hasCaption?: boolean;
  /** Actual media to render (post media, or a goal cover image). */
  mediaUrl?: string | null;
  /** Background class for text tiles (goals without an image). */
  coverColor?: string;
};

export type ExploreSearchResult = {
  id: string;
  type: "account" | "goal" | "tag" | "post";
  title: string;
  description: string;
  iconText: string;
  href: string;
};

function categoryFromPost(post: Post): string {
  return post.category?.name ?? post.goal?.category?.name ?? "";
}

function tileSize(index: number): ExploreTile["size"] {
  if (index % 7 === 0) return "large";
  if (index % 5 === 0) return "wide";
  return "small";
}

export function postToExploreTile(post: Post, index: number): ExploreTile {
  return {
    id: `post-${post.id}`,
    label: post.title,
    category: categoryFromPost(post),
    media: post.media_type === "video" ? "video" : "image",
    tone: post.media_tone,
    size: tileSize(index),
    href: `/app/posts/${post.id}?from=explore`,
    hasCaption: Boolean(post.caption),
    mediaUrl: post.media_url ?? null,
  };
}

const GOAL_TONES: ExploreTile["tone"][] = ["primary", "secondary", "muted", "card"];

export function goalToExploreTile(goal: Goal, index: number): ExploreTile {
  const hasImage = Boolean(goal.cover_image);
  return {
    id: `goal-${goal.id}`,
    label: goal.title,
    category: goal.category?.name ?? "",
    media: hasImage ? "image" : "goal",
    tone: GOAL_TONES[index % GOAL_TONES.length],
    size: tileSize(index),
    href: `/app/goals/${goal.id}?from=explore`,
    hasCaption: Boolean(goal.description),
    mediaUrl: goal.cover_image ?? null,
    coverColor: goal.cover_color || undefined,
  };
}

/** Interleaves posts and goals (2 posts : 1 goal) into a single tile feed. */
export function combineExploreTiles(posts: Post[], goals: Goal[]): ExploreTile[] {
  const tiles: ExploreTile[] = [];
  let postIndex = 0;
  let goalIndex = 0;
  let tileIndex = 0;

  while (postIndex < posts.length || goalIndex < goals.length) {
    for (let taken = 0; taken < 2 && postIndex < posts.length; taken += 1) {
      tiles.push(postToExploreTile(posts[postIndex], tileIndex));
      postIndex += 1;
      tileIndex += 1;
    }
    if (goalIndex < goals.length) {
      tiles.push(goalToExploreTile(goals[goalIndex], tileIndex));
      goalIndex += 1;
      tileIndex += 1;
    }
  }

  return tiles;
}

export function postToExploreSearchResult(post: Post): ExploreSearchResult {
  const authorName =
    post.author.display_name || post.author.username || `User ${post.author_id}`;

  return {
    id: `post-${post.id}`,
    type: "post",
    title: post.title,
    description: `Post · ${post.category?.name || post.goal?.category?.name || authorName}`,
    iconText: authorName.charAt(0).toUpperCase(),
    href: `/app/posts/${post.id}?from=explore`,
  };
}

export function goalToExploreSearchResult(goal: Goal): ExploreSearchResult {
  return {
    id: `goal-${goal.id}`,
    type: "goal",
    title: goal.title,
    description: `Goal · ${goal.category?.name || goal.status}`,
    iconText: String(goal.progress || goal.id).charAt(0),
    href: `/app/goals/${goal.id}?from=explore`,
  };
}

export function userToExploreSearchResult(user: User): ExploreSearchResult {
  const displayName = user.display_name || user.username || user.email;

  return {
    id: `user-${user.id}`,
    type: "account",
    title: user.username,
    description: `Account · ${displayName}`,
    iconText: displayName.charAt(0).toUpperCase(),
    href: `/app/users/${user.id}?from=explore`,
  };
}
