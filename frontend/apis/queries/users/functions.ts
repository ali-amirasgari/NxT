import userService from "@/apis/services/userService";
import type { ProfileUpdatePayload, SearchUsersParams } from "@/apis/types/user";

export async function getMe() {
  return userService.getMe();
}

export async function updateMe(payload: ProfileUpdatePayload) {
  return userService.updateMe(payload);
}

export async function getUser(userId: string | number) {
  return userService.getUser(userId);
}

export async function searchUsers(params: SearchUsersParams) {
  return userService.searchUsers(params);
}

export async function followUser(userId: string | number) {
  return userService.followUser(userId);
}

export async function unfollowUser(userId: string | number) {
  return userService.unfollowUser(userId);
}
