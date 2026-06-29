/**
 * User domain types. Mirrors the Django `UserSerializer` payload
 * (see backend/users/serializers/user.py) so the contract stays in sync.
 */

export type User = {
  id: number;
  user_id: number;
  username: string;
  email: string;
  is_staff: boolean;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_followed_by: boolean;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  is_private: boolean;
  notifications_enabled: boolean;
};

/** Editable profile fields — maps to the backend `ProfileUpdateSerializer`. */
export type ProfileUpdatePayload = Partial<{
  display_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  website: string;
  instagram_url: string;
  telegram_url: string;
  is_private: boolean;
  notifications_enabled: boolean;
}>;

export type SearchUsersParams = {
  search?: string;
  ids?: string;
};

// Response envelopes returned by the BFF (passthrough of the Django shapes).
export type UserEnvelope = { user: User };
export type UserListEnvelope = { users: User[] };
export type FollowResult = {
  created?: boolean;
  removed?: boolean;
  user: User;
};
