"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  followUser,
  getMe,
  getUser,
  listUsers,
  searchUsers,
  unfollowUser,
  updateMe,
} from "@/apis/queries/users/functions";
import type {
  FollowResult,
  ProfileUpdatePayload,
  SearchUsersParams,
  User,
} from "@/apis/types/user";

export function useMeQuery() {
  return useQuery<User>({
    queryKey: QUERY_KEYS.users.me,
    queryFn: getMe,
  });
}

export function useUserQuery(userId?: string | number) {
  return useQuery<User>({
    queryKey: QUERY_KEYS.users.detail(userId ?? ""),
    queryFn: () => getUser(userId as string | number),
    enabled: Boolean(userId),
  });
}

export function useUsersSearchQuery(params: SearchUsersParams) {
  const search = params.search?.trim() ?? "";

  return useQuery<User[]>({
    queryKey: QUERY_KEYS.users.search({ ...params, search }),
    queryFn: () => searchUsers({ ...params, search }),
    enabled: search.length > 0 || Boolean(params.ids),
    staleTime: 30_000,
  });
}

export function useUsersListQuery(params?: SearchUsersParams) {
  return useQuery<User[]>({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: () => listUsers(params),
    staleTime: 60_000,
  });
}

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, ProfileUpdatePayload>({
    mutationKey: QUERY_KEYS.users.updateMe,
    mutationFn: updateMe,
    onSuccess: (user) => {
      queryClient.setQueryData<User>(QUERY_KEYS.users.me, user);
    },
  });
}

/**
 * Follow/unfollow share cache-sync logic: the API returns the fresh target
 * user, so we seed the detail cache and refresh the viewer's own counts.
 */
function useFollowResultSync() {
  const queryClient = useQueryClient();

  return (result: FollowResult) => {
    queryClient.setQueryData<User>(
      QUERY_KEYS.users.detail(result.user.id),
      result.user,
    );
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.me });
  };
}

export function useFollowMutation() {
  const syncFollowResult = useFollowResultSync();

  return useMutation<FollowResult, Error, string | number>({
    mutationFn: followUser,
    onSuccess: syncFollowResult,
    onError: () => toast.error("Could not follow this user."),
  });
}

export function useUnfollowMutation() {
  const syncFollowResult = useFollowResultSync();

  return useMutation<FollowResult, Error, string | number>({
    mutationFn: unfollowUser,
    onSuccess: syncFollowResult,
    onError: () => toast.error("Could not unfollow this user."),
  });
}
