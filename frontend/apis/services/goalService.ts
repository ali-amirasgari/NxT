import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  Goal,
  GoalEnvelope,
  GoalListEnvelope,
  GoalListParams,
  GoalPayload,
} from "@/apis/types/goal";

function compactParams(params?: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  );
}

class GoalService extends BaseService {
  async listGoals(params?: GoalListParams): Promise<Goal[]> {
    const response = await this.getClient().get<GoalListEnvelope>(
      API_ROUTES.goals.list,
      { params: compactParams(params) },
    );
    return response.data.goals;
  }

  async getGoal(goalId: string | number): Promise<Goal> {
    const response = await this.getClient().get<GoalEnvelope>(
      API_ROUTES.goals.detail(goalId),
    );
    return response.data.goal;
  }

  async discoverGoals(limit?: number): Promise<Goal[]> {
    const response = await this.getClient().get<GoalListEnvelope>(
      API_ROUTES.goals.discover,
      { params: compactParams({ limit }) },
    );
    return response.data.goals;
  }

  async createGoal(payload: GoalPayload): Promise<Goal> {
    const response = await this.getClient().post<GoalEnvelope>(
      API_ROUTES.goals.list,
      payload,
    );
    return response.data.goal;
  }

  async updateGoal(goalId: string | number, payload: GoalPayload): Promise<Goal> {
    const response = await this.getClient().patch<GoalEnvelope>(
      API_ROUTES.goals.detail(goalId),
      payload,
    );
    return response.data.goal;
  }

  async deleteGoal(goalId: string | number): Promise<void> {
    await this.getClient().delete(API_ROUTES.goals.detail(goalId));
  }
}

const goalService = new GoalService();

export default goalService;
