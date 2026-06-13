import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
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
  authenticated?: boolean;
  success?: boolean;
  error?: string;
  details?: Record<string, unknown>;
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

    if (!response.data.authenticated) {
      throw new Error(response.data.error ?? "Authentication did not create a session.");
    }

    return response.data;
  }

  async logout(): Promise<AuthResponse> {
    const response = await this.getClient().post<AuthResponse>(API_ROUTES.auth.logout);

    return response.data;
  }

  async session(): Promise<AuthResponse> {
    const response = await this.getClient().get<AuthResponse>(API_ROUTES.auth.session);

    return response.data;
  }
}

const authService = new AuthService();

export default authService;
