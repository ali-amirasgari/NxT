import type { Goal } from "@/apis/types/goal";
import type { Post } from "@/apis/types/social";
import type { User } from "@/apis/types/user";

export type ExploreCategory = string;

export type ExploreTile = {
  id: string;
  label: string;
  category: string;
  media: "image" | "video";
  tone: "primary" | "secondary" | "muted" | "card";
  size: "large" | "small" | "wide";
  href: string;
  hasCaption?: boolean;
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
  };
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
