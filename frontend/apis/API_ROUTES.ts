export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
    session: "/api/auth/session",
    upstream: {
      login: "/auth/login",
      register: "/auth/register",
      refresh: "/auth/refresh",
      logout: "/auth/logout",
      session: "/users/me",
    },
  },
  users: {
    me: "/users/me",
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;
