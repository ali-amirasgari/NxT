import chatRestService from "@/apis/services/chatRestService";
import userService from "@/apis/services/userService";
import type {
  ChatUser,
  CreateDirectConversationPayload,
  CreateGroupConversationPayload,
  GetConversationParams,
  ListConversationsParams,
  SearchChatUsersParams,
  UpdateConversationMembersPayload,
} from "@/apis/types/conversation";
import type {
  ListNotificationsParams,
  MarkNotificationReadPayload,
} from "@/apis/types/notification";

export async function listConversations(params?: ListConversationsParams) {
  return chatRestService.listConversations(params);
}

export async function getConversationDetail(params: GetConversationParams) {
  return chatRestService.getConversation(params);
}

export async function createDirectConversation(
  payload: CreateDirectConversationPayload,
) {
  return chatRestService.createDirectConversation(payload);
}

export async function createGroupConversation(
  payload: CreateGroupConversationPayload,
) {
  return chatRestService.createGroupConversation(payload);
}

export async function updateConversationMembers(
  conversationId: string,
  payload: UpdateConversationMembersPayload,
) {
  return chatRestService.updateConversationMembers(conversationId, payload);
}

export async function searchChatUsers(
  params: SearchChatUsersParams,
): Promise<ChatUser[]> {
  // Repointed to the users BFF (Django users API) so chat search shares the
  // same source of truth as the rest of the user/profile domain.
  const users = await userService.searchUsers({ search: params.query });

  return users.map((user) => ({
    id: String(user.id),
    username: user.username,
    email: user.email,
    isStaff: user.is_staff,
  }));
}

export async function listNotifications(params?: ListNotificationsParams) {
  return chatRestService.listNotifications(params);
}

export async function getUnreadNotificationsCount() {
  return chatRestService.getUnreadNotificationsCount();
}

export async function markNotificationRead({
  notificationId,
}: MarkNotificationReadPayload) {
  return chatRestService.markNotificationRead(notificationId);
}

export async function markAllNotificationsRead() {
  return chatRestService.markAllNotificationsRead();
}
