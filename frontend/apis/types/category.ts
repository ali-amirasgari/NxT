import type { Post } from "@/apis/types/social";
import type { User } from "@/apis/types/user";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
};

export type SuggestedGoal = {
  id: number;
  owner_id: number;
  owner: User;
  category_id?: number | null;
  category?: Category | null;
  title: string;
  description: string;
  goal_type: "solo" | "group";
  status: string;
  progress: number;
  stake_points: number;
  created_at: string;
};

export type SuggestedCategory = {
  category: Category;
  posts: Post[];
  goals: SuggestedGoal[];
};

export type CategoryListEnvelope = { categories: Category[] };
export type SuggestedEnvelope = { suggested: SuggestedCategory[] };

export type SuggestedParams = Partial<{
  category: string;
}>;
