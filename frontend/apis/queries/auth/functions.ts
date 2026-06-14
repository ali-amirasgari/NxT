import authService from "@/apis/services/authService";
import type { LoginPayload, RegisterPayload } from "@/apis/types/auth";

export async function registerUser(payload: RegisterPayload) {
  return authService.register(payload);
}

export async function loginUser(payload: LoginPayload) {
  return authService.login(payload);
}
