export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
  },
  users: {
    me: "/users/me",
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;
