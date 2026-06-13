"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useSyncExternalStore } from "react";

import type { ChatRecord } from "@/components/page/chats/chat-data";
import { chats } from "@/components/page/chats/chat-data";
import { ChatRow } from "@/components/page/chats/chat-row";
import { StartChatDialog } from "@/components/page/chats/start-chat-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  getGroupChatsServerSnapshot,
  getGroupChatsSnapshot,
  parseGroupChats,
  subscribeToGroupChats,
} from "@/lib/group-chat-storage";

export default function ChatsPage() {
  const t = useTranslations("app.chats");
  const [query, setQuery] = useState("");
  const groupChatsSnapshot = useSyncExternalStore(
    subscribeToGroupChats,
    getGroupChatsSnapshot,
    getGroupChatsServerSnapshot,
  );
  const groupChats = useMemo(
    () =>
      parseGroupChats(groupChatsSnapshot).map(
        (group): ChatRecord => ({
          id: group.id,
          name: group.name,
          initial: group.name.charAt(0).toUpperCase(),
          preview: t("groupReady"),
          time: "",
          unread: false,
          tone: "blue",
          status: t("memberCount", { count: group.members.length }),
          imageDataUrl: group.imageDataUrl,
        }),
      ),
    [groupChatsSnapshot, t],
  );
  const allChats = useMemo(() => [...groupChats, ...chats], [groupChats]);
  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? allChats.filter(
          (chat) =>
            chat.name.toLowerCase().includes(normalized) ||
            chat.preview.toLowerCase().includes(normalized),
        )
      : allChats;
  }, [allChats, query]);

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-128px)] w-full max-w-[390px] flex-col px-1 md:max-w-3xl">
      <InputGroup className="mt-5 h-11 rounded-[14px] border-input bg-card shadow-none md:mt-2">
        <InputGroupAddon className="sr-only">
          <Icon icon="solar:magnifer-linear" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          className="px-4 text-[15px]"
        />
      </InputGroup>

      <div className="mt-[22px] space-y-[14px]">
        {filteredChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} />
        ))}
      </div>

      <StartChatDialog />
    </section>
  );
}
