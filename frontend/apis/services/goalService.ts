import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  Goal,
  GoalEnvelope,
  GoalListEnvelope,
  GoalListParams,
  GoalPayload,
  GoalProof,
  GoalProofListEnvelope,
  ProofReviewEnvelope,
  ProofVote,
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

  async listProofs(goalId: string | number): Promise<GoalProof[]> {
    const response = await this.getClient().get<GoalProofListEnvelope>(
      API_ROUTES.goals.proof(goalId),
    );
    return response.data.proofs;
  }

  async submitProof(
    goalId: string | number,
    media: File,
    note?: string,
  ): Promise<GoalProof> {
    const form = new FormData();
    form.append("media", media);
    if (note) {
      form.append("note", note);
    }
    const response = await this.getClient().post<GoalProof>(
      API_ROUTES.goals.proof(goalId),
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  }

  async reviewProof(
    proofId: string | number,
    vote: ProofVote,
  ): Promise<ProofReviewEnvelope> {
    const response = await this.getClient().post<ProofReviewEnvelope>(
      API_ROUTES.goals.proofReview(proofId),
      { vote },
    );
    return response.data;
  }

  async acceptGoal(goalId: string | number): Promise<Goal> {
    const response = await this.getClient().post<GoalEnvelope>(
      API_ROUTES.goals.accept(goalId),
    );
    return response.data.goal;
  }

  async declineGoal(goalId: string | number): Promise<void> {
    await this.getClient().post(API_ROUTES.goals.decline(goalId));
  }

  async uploadGoalCover(goalId: string | number, file: File): Promise<Goal> {
    const form = new FormData();
    form.append("cover_image", file);
    const response = await this.getClient().post<GoalEnvelope>(
      API_ROUTES.goals.cover(goalId),
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.goal;
  }
}

const goalService = new GoalService();

export default goalService;
