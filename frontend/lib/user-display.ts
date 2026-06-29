import type { User } from "@/apis/types/user";

type DisplayableUser = Pick<User, "display_name" | "username">;

/** Best human-readable name: display_name → username. Mirrors the backend's
 * `resolved_display_name` (sans full-name, which the API does not expose). */
export function resolveDisplayName(user: DisplayableUser): string {
  return user.display_name?.trim() || user.username;
}

/** Single uppercase initial for avatar fallbacks. */
export function userInitial(user: DisplayableUser): string {
  return resolveDisplayName(user).charAt(0).toUpperCase();
}
