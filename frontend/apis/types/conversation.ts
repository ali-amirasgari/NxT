export type ConversationMemberRole = "owner" | "admin" | "member";

export type ChatUser = {
  id: string;
  username: string;
  email: string;
  isStaff: boolean;
};

export type ConversationLastMessage = {
  id: string;
  room: string;
  userId: string;
  user: string;
  message: string;
  imageUrl?: string;
  timestamp: string;
};

export type ConversationMember = {
  userId: string;
  username: string;
  email: string;
  role: ConversationMemberRole;
  joinedAt: string;
  lastReadAt?: string | null;
};

export type Conversation = {
  id: string;
  type: "direct" | "group";
  name: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberRole: ConversationMemberRole;
  memberCount: number;
  members: ConversationMember[];
  lastMessage?: ConversationLastMessage | null;
  unreadCount: number;
};

export type ListConversationsParams = {
  search?: string;
};

export type GetConversationParams = {
  conversationId: string;
};

export type CreateDirectConversationPayload = {
  targetUserId: string;
};

export type ConversationMemberInput = {
  userId: string;
  role?: Exclude<ConversationMemberRole, "owner">;
};

export type CreateGroupConversationPayload = {
  name: string;
  imageUrl?: string;
  members: ConversationMemberInput[];
};

export type UpdateConversationMembersPayload = {
  members: ConversationMemberInput[];
};

export type SearchChatUsersParams = {
  query: string;
};
