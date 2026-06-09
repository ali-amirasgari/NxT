import type { Socket } from "socket.io-client";

export type ChatSocketMessage = {
  _id: string;
  room: string;
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
  user: string;
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
  user: string;
};

export type PinMessagePayload = DeleteMessagePayload & {
  pinned: boolean;
};

export type UploadImagePayload = {
  room: string;
  user: string;
  imageUrl: string;
  message?: string;
};

export type ChatServerToClientEvents = {
  room_history: (messages: ChatSocketMessage[]) => void;
  newMessage: (message: ChatSocketMessage) => void;
  message_edited: (message: ChatSocketMessage) => void;
  message_deleted: (payload: DeleteMessagePayload) => void;
  message_reaction_updated: (message: ChatSocketMessage) => void;
  message_pinned: (message: ChatSocketMessage) => void;
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
