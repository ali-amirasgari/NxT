import chatRestService from "@/apis/services/chatRestService";
import type {
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

export async function searchChatUsers(params: SearchChatUsersParams) {
  return chatRestService.searchUsers(params);
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
