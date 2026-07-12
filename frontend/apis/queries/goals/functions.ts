import goalService from "@/apis/services/goalService";
import type { GoalListParams, GoalPayload, ProofVote } from "@/apis/types/goal";

export function listGoals(params?: GoalListParams) {
  return goalService.listGoals(params);
}

export function getGoal(goalId: string | number) {
  return goalService.getGoal(goalId);
}

export function discoverGoals(limit?: number) {
  return goalService.discoverGoals(limit);
}

export function createGoal(payload: GoalPayload) {
  return goalService.createGoal(payload);
}

export function updateGoal(goalId: string | number, payload: GoalPayload) {
  return goalService.updateGoal(goalId, payload);
}

export function deleteGoal(goalId: string | number) {
  return goalService.deleteGoal(goalId);
}

export function listProofs(goalId: string | number) {
  return goalService.listProofs(goalId);
}

export function submitProof(goalId: string | number, media: File, note?: string) {
  return goalService.submitProof(goalId, media, note);
}

export function reviewProof(proofId: string | number, vote: ProofVote) {
  return goalService.reviewProof(proofId, vote);
}

export function acceptGoal(goalId: string | number) {
  return goalService.acceptGoal(goalId);
}

export function declineGoal(goalId: string | number) {
  return goalService.declineGoal(goalId);
}

export function uploadGoalCover(goalId: string | number, file: File) {
  return goalService.uploadGoalCover(goalId, file);
}
