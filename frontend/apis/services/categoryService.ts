import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  Category,
  CategoryListEnvelope,
  SuggestedCategory,
  SuggestedEnvelope,
  SuggestedParams,
} from "@/apis/types/category";

function compactParams(params?: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  );
}

class CategoryService extends BaseService {
  async listCategories(): Promise<Category[]> {
    const response = await this.getClient().get<CategoryListEnvelope>(
      API_ROUTES.social.categories,
    );
    return response.data.categories;
  }

  async getSuggested(params?: SuggestedParams): Promise<SuggestedCategory[]> {
    const response = await this.getClient().get<SuggestedEnvelope>(
      API_ROUTES.social.suggested,
      { params: compactParams(params) },
    );
    return response.data.suggested;
  }
}

const categoryService = new CategoryService();

export default categoryService;
