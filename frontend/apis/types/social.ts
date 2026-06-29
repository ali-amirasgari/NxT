import type { User } from "@/apis/types/user";

export type PostMediaType = "image" | "video" | "none";
export type PostMediaTone = "primary" | "secondary" | "muted" | "card";
export type PostVisibility = "public" | "followers" | "private";

export type PostGoalSummary = {
  id: number;
  title: string;
  category: string;
};

export type Post = {
  id: number;
  author_id: number;
  author: User;
  goal_id?: number | null;
  goal?: PostGoalSummary | null;
  title: string;
  caption: string;
  media_url: string;
  media_type: PostMediaType;
  media_tone: PostMediaTone;
  visibility: PostVisibility;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
};

export type PostPayload = Partial<{
  goal_id: number | null;
  title: string;
  caption: string;
  media_url: string;
  media_type: PostMediaType;
  media_tone: PostMediaTone;
  visibility: PostVisibility;
}>;

export type PostListParams = Partial<{
  author_id: number;
  goal_id: number;
  search: string;
  limit: number;
}>;

export type Comment = {
  id: number;
  post_id: number;
  author_id: number;
  author: User;
  parent_id?: number | null;
  body: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
};

export type CommentPayload = {
  body: string;
  parent_id?: number | null;
};

export type SharePayload = {
  channel?: "copy" | "direct";
  target_user_id?: number | null;
};

export type PostEnvelope = { post: Post };
export type PostListEnvelope = { posts: Post[] };
export type CommentEnvelope = { comment: Comment };
export type CommentListEnvelope = { comments: Comment[] };
export type PostActionEnvelope = { created?: boolean; removed?: boolean; post: Post };
export type CommentActionEnvelope = { created?: boolean; removed?: boolean; comment: Comment };
export type ShareEnvelope = { created: boolean; post: Post };
