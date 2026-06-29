"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getExplore,
  getFeed,
  getPost,
  likeComment,
  likePost,
  listComments,
  listPosts,
  savePost,
  searchExplore,
  sharePost,
  unlikeComment,
  unlikePost,
  unsavePost,
  updatePost,
} from "@/apis/queries/social/functions";
import type { CommentPayload, Post, PostListParams, PostPayload, SharePayload } from "@/apis/types/social";

export const usePostsQuery = (params?: PostListParams) =>
  useQuery({
    queryKey: QUERY_KEYS.social.posts.list(params),
    queryFn: () => listPosts(params),
  });

export const usePostQuery = (postId?: string | number) =>
  useQuery({
    queryKey: QUERY_KEYS.social.posts.detail(postId ?? ""),
    queryFn: () => getPost(postId as string | number),
    enabled: Boolean(postId),
  });

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.social.posts.create,
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.setQueryData<Post>(QUERY_KEYS.social.posts.detail(post.id), post);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.social.posts.all });
    },
  });
}

export function useUpdatePostMutation(postId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.social.posts.update, String(postId)],
    mutationFn: (payload: PostPayload) => updatePost(postId, payload),
    onSuccess: (post) => {
      queryClient.setQueryData<Post>(QUERY_KEYS.social.posts.detail(post.id), post);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.social.posts.all });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.social.posts.delete,
    mutationFn: deletePost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.social.posts.all });
    },
  });
}

export function usePostActionMutation(
  action: "like" | "unlike" | "save" | "unsave",
) {
  const queryClient = useQueryClient();
  const mutationFn = {
    like: likePost,
    unlike: unlikePost,
    save: savePost,
    unsave: unsavePost,
  }[action];

  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      queryClient.setQueryData<Post>(
        QUERY_KEYS.social.posts.detail(result.post.id),
        result.post,
      );
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.social.posts.all });
    },
  });
}

export function useSharePostMutation(postId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: SharePayload) => sharePost(postId, payload),
    onSuccess: (result) => {
      queryClient.setQueryData<Post>(
        QUERY_KEYS.social.posts.detail(result.post.id),
        result.post,
      );
    },
  });
}

export const useCommentsQuery = (postId?: string | number) =>
  useQuery({
    queryKey: QUERY_KEYS.social.comments.list(postId ?? ""),
    queryFn: () => listComments(postId as string | number),
    enabled: Boolean(postId),
  });

export function useCreateCommentMutation(postId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.social.comments.create,
    mutationFn: (payload: CommentPayload) => createComment(postId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.social.comments.list(postId),
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.social.posts.all });
    },
  });
}

export function useDeleteCommentMutation(postId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.social.comments.delete,
    mutationFn: deleteComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.social.comments.list(postId),
      });
    },
  });
}

export const useCommentActionMutation = (action: "like" | "unlike") =>
  useMutation({
    mutationFn: action === "like" ? likeComment : unlikeComment,
  });

export const useFeedQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.social.feed,
    queryFn: getFeed,
  });

export const useExploreQuery = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: QUERY_KEYS.social.explore(params),
    queryFn: () => getExplore(params),
  });

export const useExploreSearchQuery = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: QUERY_KEYS.social.exploreSearch(params),
    queryFn: () => searchExplore(params),
  });
