import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  Comment,
  CommentActionEnvelope,
  CommentEnvelope,
  CommentListEnvelope,
  CommentPayload,
  Post,
  PostActionEnvelope,
  PostEnvelope,
  PostListEnvelope,
  PostListParams,
  PostPayload,
  ShareEnvelope,
  SharePayload,
} from "@/apis/types/social";

function compactParams(params?: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  );
}

class SocialService extends BaseService {
  async listPosts(params?: PostListParams): Promise<Post[]> {
    const response = await this.getClient().get<PostListEnvelope>(
      API_ROUTES.social.posts.list,
      { params: compactParams(params) },
    );
    return response.data.posts;
  }

  async getPost(postId: string | number): Promise<Post> {
    const response = await this.getClient().get<PostEnvelope>(
      API_ROUTES.social.posts.detail(postId),
    );
    return response.data.post;
  }

  async createPost(payload: PostPayload): Promise<Post> {
    const response = await this.getClient().post<PostEnvelope>(
      API_ROUTES.social.posts.list,
      payload,
    );
    return response.data.post;
  }

  async updatePost(postId: string | number, payload: PostPayload): Promise<Post> {
    const response = await this.getClient().patch<PostEnvelope>(
      API_ROUTES.social.posts.detail(postId),
      payload,
    );
    return response.data.post;
  }

  async deletePost(postId: string | number): Promise<void> {
    await this.getClient().delete(API_ROUTES.social.posts.detail(postId));
  }

  async likePost(postId: string | number): Promise<PostActionEnvelope> {
    const response = await this.getClient().post<PostActionEnvelope>(
      API_ROUTES.social.posts.like(postId),
    );
    return response.data;
  }

  async unlikePost(postId: string | number): Promise<PostActionEnvelope> {
    const response = await this.getClient().delete<PostActionEnvelope>(
      API_ROUTES.social.posts.like(postId),
    );
    return response.data;
  }

  async savePost(postId: string | number): Promise<PostActionEnvelope> {
    const response = await this.getClient().post<PostActionEnvelope>(
      API_ROUTES.social.posts.save(postId),
    );
    return response.data;
  }

  async unsavePost(postId: string | number): Promise<PostActionEnvelope> {
    const response = await this.getClient().delete<PostActionEnvelope>(
      API_ROUTES.social.posts.save(postId),
    );
    return response.data;
  }

  async sharePost(
    postId: string | number,
    payload: SharePayload = {},
  ): Promise<ShareEnvelope> {
    const response = await this.getClient().post<ShareEnvelope>(
      API_ROUTES.social.posts.share(postId),
      payload,
    );
    return response.data;
  }

  async listComments(postId: string | number): Promise<Comment[]> {
    const response = await this.getClient().get<CommentListEnvelope>(
      API_ROUTES.social.posts.comments(postId),
    );
    return response.data.comments;
  }

  async createComment(
    postId: string | number,
    payload: CommentPayload,
  ): Promise<Comment> {
    const response = await this.getClient().post<CommentEnvelope>(
      API_ROUTES.social.posts.comments(postId),
      payload,
    );
    return response.data.comment;
  }

  async deleteComment(commentId: string | number): Promise<void> {
    await this.getClient().delete(API_ROUTES.social.comments.detail(commentId));
  }

  async likeComment(commentId: string | number): Promise<CommentActionEnvelope> {
    const response = await this.getClient().post<CommentActionEnvelope>(
      API_ROUTES.social.comments.like(commentId),
    );
    return response.data;
  }

  async unlikeComment(commentId: string | number): Promise<CommentActionEnvelope> {
    const response = await this.getClient().delete<CommentActionEnvelope>(
      API_ROUTES.social.comments.like(commentId),
    );
    return response.data;
  }

  async feed(): Promise<Post[]> {
    const response = await this.getClient().get<PostListEnvelope>(API_ROUTES.social.feed);
    return response.data.posts;
  }

  async explore(params?: Record<string, unknown>): Promise<Post[]> {
    const response = await this.getClient().get<PostListEnvelope>(
      API_ROUTES.social.explore,
      { params: compactParams(params) },
    );
    return response.data.posts;
  }

  async exploreSearch(params?: Record<string, unknown>): Promise<Post[]> {
    const response = await this.getClient().get<PostListEnvelope>(
      API_ROUTES.social.exploreSearch,
      { params: compactParams(params) },
    );
    return response.data.posts;
  }
}

const socialService = new SocialService();

export default socialService;
