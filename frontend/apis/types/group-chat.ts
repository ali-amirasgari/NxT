export type GroupMemberRole = "member" | "admin";

export type GroupChatMember = {
  id: string;
  name: string;
  initial: string;
  role: GroupMemberRole;
};

export type GroupChat = {
  id: string;
  name: string;
  imageDataUrl?: string;
  createdAt: string;
  members: GroupChatMember[];
};

export type CreateGroupChatInput = {
  name: string;
  imageDataUrl?: string;
  members: GroupChatMember[];
};
