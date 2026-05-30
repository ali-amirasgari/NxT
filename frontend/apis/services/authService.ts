import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  access?: string;
  refresh?: string;
}

class AuthService extends BaseService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await this.getClient().post<AuthResponse>(
      API_ROUTES.auth.register,
      payload
    );

    return response.data;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.getClient().post<AuthResponse>(
      API_ROUTES.auth.login,
      payload
    );

    return response.data;
  }
}

const authService = new AuthService();

export default authService;
