export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"],
    register: ["auth", "register"],
    login: ["auth", "login"],
  },
  users: {
    all: ["users"],
    me: ["users", "me"],
    detail: (userId: string | number) => ["users", "detail", String(userId)] as const,
    search: (params: Record<string, unknown>) =>
      ["users", "search", params] as const,
    follow: (userId: string | number) => ["users", "follow", String(userId)] as const,
    updateMe: ["users", "update-me"],
  },
  chat: {
    conversations: {
      all: ["chat", "conversations"],
      list: (params?: Record<string, unknown>) =>
        ["chat", "conversations", "list", params ?? {}] as const,
      detail: (conversationId: string) =>
        ["chat", "conversations", "detail", conversationId] as const,
      createDirect: ["chat", "conversations", "create-direct"],
      createGroup: ["chat", "conversations", "create-group"],
      updateMembers: ["chat", "conversations", "update-members"],
    },
    users: {
      search: (params: Record<string, unknown>) =>
        ["chat", "users", "search", params] as const,
    },
    notifications: {
      all: ["chat", "notifications"],
      list: (params?: Record<string, unknown>) =>
        ["chat", "notifications", "list", params ?? {}] as const,
      unreadCount: ["chat", "notifications", "unread-count"],
      markRead: ["chat", "notifications", "mark-read"],
      markAllRead: ["chat", "notifications", "mark-all-read"],
    },
  },
} as const;

export type QueryKeys = typeof QUERY_KEYS;
