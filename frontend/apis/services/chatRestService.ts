import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import { getChatServiceBaseUrl } from "@/apis/services/chatServiceUrl";
import type {
  Conversation,
  CreateDirectConversationPayload,
  CreateGroupConversationPayload,
  GetConversationParams,
  ListConversationsParams,
  SearchChatUsersParams,
  UpdateConversationMembersPayload,
  ChatUser,
} from "@/apis/types/conversation";
import type {
  ChatNotification,
  ListNotificationsParams,
  MarkAllNotificationsReadResponse,
  NotificationUnreadCount,
} from "@/apis/types/notification";

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

class ChatRestService extends BaseService {
  protected override getBaseUrl(): string {
    return getChatServiceBaseUrl();
  }

  async listConversations(params?: ListConversationsParams): Promise<Conversation[]> {
    const response = await this.getClient().get<{ conversations: Conversation[] }>(
      API_ROUTES.chat.conversations.list,
      {
        params: buildQueryParams(params),
      },
    );

    return response.data.conversations;
  }

  async getConversation({
    conversationId,
  }: GetConversationParams): Promise<Conversation> {
    const response = await this.getClient().get<{ conversation: Conversation }>(
      API_ROUTES.chat.conversations.detail(conversationId),
    );

    return response.data.conversation;
  }

  async createDirectConversation(
    payload: CreateDirectConversationPayload,
  ): Promise<Conversation> {
    const response = await this.getClient().post<{ conversation: Conversation }>(
      API_ROUTES.chat.conversations.direct,
      payload,
    );

    return response.data.conversation;
  }

  async createGroupConversation(
    payload: CreateGroupConversationPayload,
  ): Promise<Conversation> {
    const response = await this.getClient().post<{ conversation: Conversation }>(
      API_ROUTES.chat.conversations.group,
      payload,
    );

    return response.data.conversation;
  }

  async updateConversationMembers(
    conversationId: string,
    payload: UpdateConversationMembersPayload,
  ): Promise<Conversation> {
    const response = await this.getClient().post<{ conversation: Conversation }>(
      API_ROUTES.chat.conversations.members(conversationId),
      payload,
    );

    return response.data.conversation;
  }

  async searchUsers(params: SearchChatUsersParams): Promise<ChatUser[]> {
    const response = await this.getClient().get<{
      users: Array<{
        id: number;
        username: string;
        email: string;
        is_staff: boolean;
      }>;
    }>(
      API_ROUTES.chat.users.search,
      {
        params: buildQueryParams({ search: params.query }),
      },
    );

    return response.data.users.map((user) => ({
      id: String(user.id),
      username: user.username,
      email: user.email,
      isStaff: user.is_staff,
    }));
  }

  async listNotifications(
    params?: ListNotificationsParams,
  ): Promise<ChatNotification[]> {
    const response = await this.getClient().get<{
      notifications: ChatNotification[];
    }>(
      API_ROUTES.chat.notifications.list,
      {
        params: buildQueryParams(params),
      },
    );

    return response.data.notifications;
  }

  async getUnreadNotificationsCount(): Promise<NotificationUnreadCount> {
    const response = await this.getClient().get<NotificationUnreadCount>(
      API_ROUTES.chat.notifications.unreadCount,
    );

    return response.data;
  }

  async markNotificationRead(notificationId: string): Promise<ChatNotification> {
    const response = await this.getClient().patch<{
      notification: ChatNotification;
    }>(
      API_ROUTES.chat.notifications.markRead(notificationId),
    );

    return response.data.notification;
  }

  async markAllNotificationsRead(): Promise<MarkAllNotificationsReadResponse> {
    await this.getClient().post<MarkAllNotificationsReadResponse>(
      API_ROUTES.chat.notifications.markAllRead,
    );
  }
}

const chatRestService = new ChatRestService();

export default chatRestService;
