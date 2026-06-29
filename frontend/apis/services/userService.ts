import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  FollowResult,
  ProfileUpdatePayload,
  SearchUsersParams,
  User,
  UserEnvelope,
  UserListEnvelope,
} from "@/apis/types/user";

function buildQueryParams(params?: Record<string, unknown>) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    }),
  );
}

/**
 * Transport for the user/profile domain. Talks to the same-origin BFF routes
 * (`/api/users/*`); the inherited 401 interceptor handles silent token refresh.
 */
class UserService extends BaseService {
  async getMe(): Promise<User> {
    const response = await this.getClient().get<UserEnvelope>(API_ROUTES.users.me);

    return response.data.user;
  }

  async updateMe(payload: ProfileUpdatePayload): Promise<User> {
    const response = await this.getClient().patch<UserEnvelope>(
      API_ROUTES.users.me,
      payload,
    );

    return response.data.user;
  }

  async getUser(userId: string | number): Promise<User> {
    const response = await this.getClient().get<UserEnvelope>(
      API_ROUTES.users.detail(userId),
    );

    return response.data.user;
  }

  async searchUsers(params: SearchUsersParams): Promise<User[]> {
    const response = await this.getClient().get<UserListEnvelope>(
      API_ROUTES.users.list,
      { params: buildQueryParams({ ...params }) },
    );

    return response.data.users;
  }

  async followUser(userId: string | number): Promise<FollowResult> {
    const response = await this.getClient().post<FollowResult>(
      API_ROUTES.users.follow(userId),
    );

    return response.data;
  }

  async unfollowUser(userId: string | number): Promise<FollowResult> {
    const response = await this.getClient().delete<FollowResult>(
      API_ROUTES.users.follow(userId),
    );

    return response.data;
  }
}

const userService = new UserService();

export default userService;
