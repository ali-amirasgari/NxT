import categoryService from "@/apis/services/categoryService";
import socialService from "@/apis/services/socialService";
import type { SuggestedParams } from "@/apis/types/category";
import type { CommentPayload, PostListParams, PostPayload, SharePayload } from "@/apis/types/social";

export const listPosts = (params?: PostListParams) => socialService.listPosts(params);
export const getPost = (postId: string | number) => socialService.getPost(postId);
export const createPost = (payload: PostPayload) => socialService.createPost(payload);
export const updatePost = (postId: string | number, payload: PostPayload) =>
  socialService.updatePost(postId, payload);
export const deletePost = (postId: string | number) => socialService.deletePost(postId);
export const likePost = (postId: string | number) => socialService.likePost(postId);
export const unlikePost = (postId: string | number) => socialService.unlikePost(postId);
export const savePost = (postId: string | number) => socialService.savePost(postId);
export const unsavePost = (postId: string | number) => socialService.unsavePost(postId);
export const sharePost = (postId: string | number, payload?: SharePayload) =>
  socialService.sharePost(postId, payload);
export const listComments = (postId: string | number) => socialService.listComments(postId);
export const createComment = (postId: string | number, payload: CommentPayload) =>
  socialService.createComment(postId, payload);
export const deleteComment = (commentId: string | number) => socialService.deleteComment(commentId);
export const likeComment = (commentId: string | number) => socialService.likeComment(commentId);
export const unlikeComment = (commentId: string | number) => socialService.unlikeComment(commentId);
export const getFeed = () => socialService.feed();
export const getExplore = (params?: Record<string, unknown>) => socialService.explore(params);
export const searchExplore = (params?: Record<string, unknown>) =>
  socialService.exploreSearch(params);
export const listCategories = () => categoryService.listCategories();
export const getSuggested = (params?: SuggestedParams) => categoryService.getSuggested(params);
