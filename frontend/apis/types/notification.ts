export type ChatNotificationType =
  | "conversation_created"
  | "member_added"
  | "member_role_updated"
  | "member_removed"
  | "message_received";

export type ChatNotification = {
  id: string;
  userId: string;
  conversationId: string;
  type: ChatNotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
};

export type ListNotificationsParams = {
  unreadOnly?: boolean;
};

export type NotificationUnreadCount = {
  unreadCount: number;
};

export type MarkNotificationReadPayload = {
  notificationId: string;
};

export type MarkAllNotificationsReadResponse = void;
