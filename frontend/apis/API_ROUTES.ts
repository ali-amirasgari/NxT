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
  goals: {
    list: "/api/goals",
    detail: (goalId: string | number) => `/api/goals/${goalId}`,
    upstream: {
      list: "/goals",
      detail: (goalId: string | number) => `/goals/${goalId}`,
    },
  },
  wallet: {
    list: "/api/wallets",
    detail: (walletId: string | number) => `/api/wallets/${walletId}`,
    ledger: (walletId: string | number) => `/api/wallets/${walletId}/ledger`,
    credit: "/api/wallets/credit",
    debit: "/api/wallets/debit",
    hold: "/api/wallets/hold",
    release: "/api/wallets/release",
    capture: "/api/wallets/capture",
    upstream: {
      list: "/wallets",
      detail: (walletId: string | number) => `/wallets/${walletId}`,
      ledger: (walletId: string | number) => `/wallets/${walletId}/ledger`,
      credit: "/wallets/credit",
      debit: "/wallets/debit",
      hold: "/wallets/hold",
      release: "/wallets/release",
      capture: "/wallets/capture",
    },
  },
  social: {
    posts: {
      list: "/api/posts",
      detail: (postId: string | number) => `/api/posts/${postId}`,
      like: (postId: string | number) => `/api/posts/${postId}/like`,
      save: (postId: string | number) => `/api/posts/${postId}/save`,
      share: (postId: string | number) => `/api/posts/${postId}/share`,
      comments: (postId: string | number) => `/api/posts/${postId}/comments`,
    },
    comments: {
      detail: (commentId: string | number) => `/api/comments/${commentId}`,
      like: (commentId: string | number) => `/api/comments/${commentId}/like`,
    },
    feed: "/api/feed",
    explore: "/api/explore",
    exploreSearch: "/api/explore/search",
    categories: "/api/categories",
    suggested: "/api/suggested",
    upstream: {
      posts: {
        list: "/posts",
        detail: (postId: string | number) => `/posts/${postId}`,
        like: (postId: string | number) => `/posts/${postId}/like`,
        save: (postId: string | number) => `/posts/${postId}/save`,
        share: (postId: string | number) => `/posts/${postId}/share`,
        comments: (postId: string | number) => `/posts/${postId}/comments`,
      },
      comments: {
        detail: (commentId: string | number) => `/comments/${commentId}`,
        like: (commentId: string | number) => `/comments/${commentId}/like`,
      },
      feed: "/feed",
      explore: "/explore",
      exploreSearch: "/explore/search",
      categories: "/categories",
      suggested: "/suggested",
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
