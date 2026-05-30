import authService, { LoginPayload, RegisterPayload } from "@/apis/services/authService";

export async function registerUser(payload: RegisterPayload) {
  try {
    return await authService.register(payload);
  } catch (error) {
    throw error;
  }
}

export async function loginUser(payload: LoginPayload) {
  try {
    return await authService.login(payload);
  } catch (error) {
    throw error;
  }
}
