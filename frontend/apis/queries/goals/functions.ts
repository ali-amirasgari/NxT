import goalService from "@/apis/services/goalService";
import type { GoalListParams, GoalPayload } from "@/apis/types/goal";

export function listGoals(params?: GoalListParams) {
  return goalService.listGoals(params);
}

export function getGoal(goalId: string | number) {
  return goalService.getGoal(goalId);
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
