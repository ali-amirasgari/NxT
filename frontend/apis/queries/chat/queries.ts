"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  createDirectConversation,
  createGroupConversation,
  getConversationDetail,
  getUnreadNotificationsCount,
  listConversations,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  searchChatUsers,
  updateConversationMembers,
} from "@/apis/queries/chat/functions";
import type {
  CreateDirectConversationPayload,
  CreateGroupConversationPayload,
  ListConversationsParams,
  SearchChatUsersParams,
  UpdateConversationMembersPayload,
} from "@/apis/types/conversation";
import type {
  ListNotificationsParams,
  MarkNotificationReadPayload,
} from "@/apis/types/notification";

export function useConversationsQuery(params?: ListConversationsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.chat.conversations.list(params),
    queryFn: () => listConversations(params),
  });
}

export function useConversationDetailQuery(conversationId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.chat.conversations.detail(conversationId ?? ""),
    queryFn: () => getConversationDetail({ conversationId: conversationId ?? "" }),
    enabled: Boolean(conversationId),
  });
}

export function useCreateDirectConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: QUERY_KEYS.chat.conversations.createDirect,
    mutationFn: (payload: CreateDirectConversationPayload) =>
      createDirectConversation(payload),
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.conversations.all,
      });
      queryClient.setQueryData(
        QUERY_KEYS.chat.conversations.detail(conversation.id),
        conversation,
      );
    },
  });
}

export function useCreateGroupConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: QUERY_KEYS.chat.conversations.createGroup,
    mutationFn: (payload: CreateGroupConversationPayload) =>
      createGroupConversation(payload),
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.conversations.all,
      });
      queryClient.setQueryData(
        QUERY_KEYS.chat.conversations.detail(conversation.id),
        conversation,
      );
    },
  });
}

export function useUpdateConversationMembersMutation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...QUERY_KEYS.chat.conversations.updateMembers, conversationId],
    mutationFn: (payload: UpdateConversationMembersPayload) =>
      updateConversationMembers(conversationId, payload),
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.conversations.all,
      });
      queryClient.setQueryData(
        QUERY_KEYS.chat.conversations.detail(conversation.id),
        conversation,
      );
    },
  });
}

export function useChatUsersSearchQuery(params: SearchChatUsersParams) {
  const normalizedQuery = params.query.trim();

  return useQuery({
    queryKey: QUERY_KEYS.chat.users.search({
      ...params,
      query: normalizedQuery,
    }),
    queryFn: () =>
      searchChatUsers({
        ...params,
        query: normalizedQuery,
      }),
    enabled: normalizedQuery.length > 0,
    staleTime: 30_000,
  });
}

export function useNotificationsQuery(params?: ListNotificationsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.chat.notifications.list(params),
    queryFn: () => listNotifications(params),
  });
}

export function useUnreadNotificationsCountQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.chat.notifications.unreadCount,
    queryFn: getUnreadNotificationsCount,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: QUERY_KEYS.chat.notifications.markRead,
    mutationFn: ({ notificationId }: MarkNotificationReadPayload) =>
      markNotificationRead({ notificationId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.notifications.all,
      });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: QUERY_KEYS.chat.notifications.markAllRead,
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.notifications.all,
      });
    },
  });
}
