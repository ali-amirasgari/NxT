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
    // Browser-facing BFF endpoints (same-origin Next.js route handlers that
    // attach the access-token cookie and proxy to the Django backend).
    me: "/api/users/me",
    list: "/api/users",
    detail: (userId: string | number) => `/api/users/${userId}`,
    follow: (userId: string | number) => `/api/users/${userId}/follow`,
    // Upstream Django paths consumed by the BFF handlers above.
    upstream: {
      me: "/users/me",
      list: "/users",
      detail: (userId: string | number) => `/users/${userId}`,
      follow: (userId: string | number) => `/users/${userId}/follow`,
    },
  },
  chat: {
    conversations: {
      list: "/conversations",
      detail: (conversationId: string) => `/conversations/${conversationId}`,
      direct: "/conversations/direct",
      group: "/conversations/group",
      members: (conversationId: string) =>
        `/conversations/${conversationId}/members`,
    },
    users: {
      search: "/users",
    },
    notifications: {
      list: "/notifications",
      unreadCount: "/notifications/unread-count",
      markRead: (notificationId: string) => `/notifications/${notificationId}/read`,
      markAllRead: "/notifications/read-all",
    },
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;
