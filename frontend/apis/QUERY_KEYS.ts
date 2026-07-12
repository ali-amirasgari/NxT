export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"],
    register: ["auth", "register"],
    login: ["auth", "login"],
  },
  users: {
    all: ["users"],
    me: ["users", "me"],
    list: (params?: Record<string, unknown>) =>
      ["users", "list", params ?? {}] as const,
    detail: (userId: string | number) => ["users", "detail", String(userId)] as const,
    search: (params: Record<string, unknown>) =>
      ["users", "search", params] as const,
    follow: (userId: string | number) => ["users", "follow", String(userId)] as const,
    updateMe: ["users", "update-me"],
  },
  goals: {
    all: ["goals"],
    list: (params?: Record<string, unknown>) => ["goals", "list", params ?? {}] as const,
    discover: (limit?: number) => ["goals", "discover", limit ?? null] as const,
    detail: (goalId: string | number) => ["goals", "detail", String(goalId)] as const,
    create: ["goals", "create"],
    update: ["goals", "update"],
    delete: ["goals", "delete"],
    proofs: (goalId: string | number) => ["goals", "proofs", String(goalId)] as const,
    submitProof: ["goals", "submit-proof"],
    reviewProof: ["goals", "review-proof"],
  },
  events: {
    all: ["events"],
    list: (params?: Record<string, unknown>) => ["events", "list", params ?? {}] as const,
    detail: (eventId: string | number) => ["events", "detail", String(eventId)] as const,
    create: ["events", "create"],
    update: ["events", "update"],
    delete: ["events", "delete"],
    rsvp: ["events", "rsvp"],
    unrsvp: ["events", "unrsvp"],
  },
  wallet: {
    all: ["wallet"],
    list: ["wallet", "list"],
    detail: (walletId: string | number) => ["wallet", "detail", String(walletId)] as const,
    ledger: (walletId: string | number, params?: Record<string, unknown>) =>
      ["wallet", "ledger", String(walletId), params ?? {}] as const,
    mutation: ["wallet", "mutation"],
  },
  social: {
    posts: {
      all: ["social", "posts"],
      list: (params?: Record<string, unknown>) =>
        ["social", "posts", "list", params ?? {}] as const,
      detail: (postId: string | number) =>
        ["social", "posts", "detail", String(postId)] as const,
      create: ["social", "posts", "create"],
      update: ["social", "posts", "update"],
      delete: ["social", "posts", "delete"],
    },
    comments: {
      list: (postId: string | number) =>
        ["social", "comments", "list", String(postId)] as const,
      create: ["social", "comments", "create"],
      delete: ["social", "comments", "delete"],
    },
    feed: ["social", "feed"],
    explore: (params?: Record<string, unknown>) =>
      ["social", "explore", params ?? {}] as const,
    exploreSearch: (params?: Record<string, unknown>) =>
      ["social", "explore-search", params ?? {}] as const,
    categories: ["social", "categories"],
    suggested: (params?: Record<string, unknown>) =>
      ["social", "suggested", params ?? {}] as const,
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
