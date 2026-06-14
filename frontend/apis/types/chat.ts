import type { Socket } from "socket.io-client";
import type { Conversation } from "@/apis/types/conversation";
import type { ChatNotification } from "@/apis/types/notification";

export type ChatSocketMessage = {
  _id: string;
  room: string;
  userId?: string;
  user: string;
  message: string;
  imageUrl?: string;
  replyTo?: string;
  mentions?: string[];
  reactions?: Record<string, string[]>;
  pinned?: boolean;
  edited?: boolean;
  deleted?: boolean;
  timestamp: string;
  editedAt?: string | null;
};

export type SendMessagePayload = {
  room: string;
  message: string;
  imageUrl?: string;
  replyTo?: string;
  mentions?: string[];
};

export type EditMessagePayload = {
  room: string;
  messageId: string;
  message: string;
  imageUrl?: string;
};

export type DeleteMessagePayload = {
  room: string;
  messageId: string;
};

export type AddReactionPayload = DeleteMessagePayload & {
  emoji: string;
};

export type PinMessagePayload = DeleteMessagePayload & {
  pinned: boolean;
};

export type UploadImagePayload = {
  room: string;
  imageUrl: string;
  message?: string;
};

export type ChatAttachment = {
  name: string;
  dataUrl: string;
  mimeType: string;
};

export type ChatSocketUser = {
  id: string;
  username: string;
  email: string;
  isStaff: boolean;
};

export type ChatSocketError = {
  event: string;
  code: string;
  message: string;
};

export type ChatServerToClientEvents = {
  authenticated: (user: ChatSocketUser) => void;
  socket_error: (error: ChatSocketError) => void;
  room_history: (messages: ChatSocketMessage[]) => void;
  newMessage: (message: ChatSocketMessage) => void;
  message_edited: (message: ChatSocketMessage) => void;
  message_deleted: (payload: DeleteMessagePayload) => void;
  message_reaction_updated: (message: ChatSocketMessage) => void;
  message_pinned: (message: ChatSocketMessage) => void;
  "conversation:updated": (conversation: Conversation) => void;
  "notification:new": (notification: ChatNotification) => void;
  "notification:unread_count": (payload: {
    userId: string;
    unreadCount: number;
  }) => void;
};

export type ChatClientToServerEvents = {
  join_room: (room: string) => void;
  send_message: (payload: SendMessagePayload) => void;
  edit_message: (payload: EditMessagePayload) => void;
  delete_message: (payload: DeleteMessagePayload) => void;
  add_reaction: (payload: AddReactionPayload) => void;
  pin_message: (payload: PinMessagePayload) => void;
  upload_image: (payload: UploadImagePayload) => void;
};

export type ChatSocket = Socket<
  ChatServerToClientEvents,
  ChatClientToServerEvents
>;
