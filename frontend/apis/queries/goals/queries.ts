"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  acceptGoal,
  createGoal,
  declineGoal,
  deleteGoal,
  discoverGoals,
  getGoal,
  listGoals,
  listProofs,
  reviewProof,
  submitProof,
  updateGoal,
  uploadGoalCover,
} from "@/apis/queries/goals/functions";
import type {
  Goal,
  GoalListParams,
  GoalPayload,
  ProofVote,
} from "@/apis/types/goal";

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

export function useDiscoverGoalsQuery(limit?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.goals.discover(limit),
    queryFn: () => discoverGoals(limit),
    staleTime: 0,
    refetchOnMount: "always",
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

export function useGoalProofsQuery(goalId?: string | number) {
  return useQuery({
    queryKey: QUERY_KEYS.goals.proofs(goalId ?? ""),
    queryFn: () => listProofs(goalId as string | number),
    enabled: Boolean(goalId),
  });
}

export function useSubmitProofMutation(goalId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.goals.submitProof, String(goalId)],
    mutationFn: ({ media, note }: { media: File; note?: string }) =>
      submitProof(goalId, media, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.proofs(goalId) });
    },
  });
}

export function useReviewProofMutation(goalId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.goals.reviewProof, String(goalId)],
    mutationFn: ({ proofId, vote }: { proofId: number; vote: ProofVote }) =>
      reviewProof(proofId, vote),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.proofs(goalId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.detail(goalId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet.all });
    },
  });
}

export function useAcceptGoalMutation(goalId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["goals", "accept", String(goalId)],
    mutationFn: () => acceptGoal(goalId),
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal>(QUERY_KEYS.goals.detail(goal.id), goal);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.all });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet.all });
    },
  });
}

export function useDeclineGoalMutation(goalId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["goals", "decline", String(goalId)],
    mutationFn: () => declineGoal(goalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.detail(goalId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.all });
    },
  });
}

export function useUploadGoalCoverMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["goals", "cover"],
    mutationFn: ({ goalId, file }: { goalId: number; file: File }) =>
      uploadGoalCover(goalId, file),
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal>(QUERY_KEYS.goals.detail(goal.id), goal);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals.all });
    },
  });
}
