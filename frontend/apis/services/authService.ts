import axios from "axios";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/apis/types/auth";

function findFirstError(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(findFirstError).find(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(findFirstError).find(Boolean);
  }

  return undefined;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<AuthResponse>(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const payload = error.response?.data;

  return (
    payload?.error ||
    payload?.detail ||
    payload?.non_field_errors?.[0] ||
    findFirstError(payload?.details) ||
    findFirstError(payload) ||
    fallback
  );
}

class AuthService extends BaseService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await this.getClient().post<AuthResponse>(
        API_ROUTES.auth.register,
        payload,
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to create account."));
    }
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await this.getClient().post<AuthResponse>(
        API_ROUTES.auth.login,
        payload,
      );

      if (!response.data.authenticated) {
        throw new Error(
          response.data.error ?? "Authentication did not create a session.",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to sign in."));
    }
  }

  async logout(): Promise<AuthResponse> {
    const response = await this.getClient().post<AuthResponse>(API_ROUTES.auth.logout);

    return response.data;
  }

  async refresh(): Promise<AuthResponse> {
    const response = await this.getClient().post<AuthResponse>(API_ROUTES.auth.refresh);

    return response.data;
  }

  async session(): Promise<AuthResponse> {
    const response = await this.getClient().get<AuthResponse>(API_ROUTES.auth.session);

    return response.data;
  }
}

const authService = new AuthService();

export default authService;
