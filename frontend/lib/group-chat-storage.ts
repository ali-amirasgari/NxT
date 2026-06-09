import type {
  CreateGroupChatInput,
  GroupChat,
} from "@/apis/types/group-chat";

const GROUP_CHAT_STORAGE_KEY = "nxt-group-chats";
const GROUP_CHAT_EVENT = "nxt-group-chats-change";

const DEFAULT_GROUP_CHATS: GroupChat[] = [];

function createGroupChatId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStorage(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function emitGroupChatChange() {
  window.dispatchEvent(new Event(GROUP_CHAT_EVENT));
}

export function getGroupChatsSnapshot() {
  return readStorage(
    GROUP_CHAT_STORAGE_KEY,
    JSON.stringify(DEFAULT_GROUP_CHATS),
  );
}

export function getGroupChatsServerSnapshot() {
  return JSON.stringify(DEFAULT_GROUP_CHATS);
}

export function parseGroupChats(snapshot: string): GroupChat[] {
  try {
    const parsed = JSON.parse(snapshot);

    if (!Array.isArray(parsed)) {
      return DEFAULT_GROUP_CHATS;
    }

    return parsed.filter(
      (group): group is GroupChat =>
        Boolean(
          group &&
            typeof group === "object" &&
            typeof group.id === "string" &&
            typeof group.name === "string" &&
            typeof group.createdAt === "string" &&
            Array.isArray(group.members),
        ),
    );
  } catch {
    return DEFAULT_GROUP_CHATS;
  }
}

export function readGroupChats() {
  return parseGroupChats(getGroupChatsSnapshot());
}

export function createGroupChat(input: CreateGroupChatInput): GroupChat {
  const nextGroup: GroupChat = {
    id: createGroupChatId(),
    name: input.name.trim(),
    createdAt: new Date().toISOString(),
    members: input.members,
    ...(input.imageDataUrl ? { imageDataUrl: input.imageDataUrl } : {}),
  };

  const nextGroups = [...readGroupChats(), nextGroup];
  window.localStorage.setItem(
    GROUP_CHAT_STORAGE_KEY,
    JSON.stringify(nextGroups),
  );
  emitGroupChatChange();

  return nextGroup;
}

export function subscribeToGroupChats(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === GROUP_CHAT_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(GROUP_CHAT_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(GROUP_CHAT_EVENT, onStoreChange);
  };
}
