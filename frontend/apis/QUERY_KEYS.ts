export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"],
    register: ["auth", "register"],
    login: ["auth", "login"],
  },
  users: {
    me: ["users", "me"],
  },
} as const;

export type QueryKeys = typeof QUERY_KEYS;
