"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  createGoal,
  deleteGoal,
  getGoal,
  listGoals,
  updateGoal,
} from "@/apis/queries/goals/functions";
import type { Goal, GoalListParams, GoalPayload } from "@/apis/types/goal";

export function useGoalsQuery(params?: GoalListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.goals.list(params),
    queryFn: () => listGoals(params),
  });
}

export function useGoalQuery(goalId?: string | number) {
  return useQuery({
    queryKey: QUERY_KEYS.goals.detail(goalId ?? ""),
    queryFn: () => getGoal(goalId as string | number),
    enabled: Boolean(goalId),
  });
}

export function useCreateGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.goals.create,
    mutationFn: createGoal,
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal>(QUERY_KEYS.goals.detail(goal.id), goal);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.all });
    },
  });
}

export function useUpdateGoalMutation(goalId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.goals.update, String(goalId)],
    mutationFn: (payload: GoalPayload) => updateGoal(goalId, payload),
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal>(QUERY_KEYS.goals.detail(goal.id), goal);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.all });
    },
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.goals.delete,
    mutationFn: deleteGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.all });
    },
  });
}
