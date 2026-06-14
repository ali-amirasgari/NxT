export type AuthUser = {
  id: number;
  user_id: number;
  username: string;
  email: string;
  is_staff: boolean;
};

export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  authenticated?: boolean;
  success?: boolean;
  user?: AuthUser;
  error?: string;
  detail?: string;
  details?: Record<string, unknown>;
  non_field_errors?: string[];
};
