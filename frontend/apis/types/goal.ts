import type { User } from "@/apis/types/user";

export type GoalMemberRole = "owner" | "admin" | "member";
export type GoalType = "solo" | "group";
export type GoalStatus = "active" | "completed" | "failed" | "paused" | "archived";

export type GoalMember = {
  user_id: number;
  user: User;
  role: GoalMemberRole;
  created_at: string;
};

export type Goal = {
  id: number;
  owner_id: number;
  owner: User;
  title: string;
  description: string;
  category: string;
  goal_type: GoalType;
  status: GoalStatus;
  progress: number;
  stake_points: number;
  schedule_label: string;
  cover_color: string;
  starts_at?: string | null;
  due_at?: string | null;
  members: GoalMember[];
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type GoalMemberInput = {
  user_id: number;
  role?: Exclude<GoalMemberRole, "owner">;
};

export type GoalPayload = Partial<{
  title: string;
  description: string;
  category: string;
  goal_type: GoalType;
  status: GoalStatus;
  progress: number;
  stake_points: number;
  schedule_label: string;
  cover_color: string;
  starts_at: string | null;
  due_at: string | null;
  members: GoalMemberInput[];
}>;

export type GoalListParams = Partial<{
  status: GoalStatus;
  category: string;
  search: string;
}>;

export type GoalEnvelope = { goal: Goal };
export type GoalListEnvelope = { goals: Goal[] };
