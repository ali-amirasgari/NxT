"use client";

import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import { useConversationsQuery } from "@/apis/queries/chat/queries";
import chatSocketService from "@/apis/services/chatSocketService";
import type { ChatRecord } from "@/components/page/chats/chat-data";
import { ChatRow } from "@/components/page/chats/chat-row";
import { StartChatDialog } from "@/components/page/chats/start-chat-dialog";
import { Typography } from "@/components/ui/typography";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
export default function ChatsPage() {
  const t = useTranslations("app.chats");
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const conversationsQuery = useConversationsQuery();
  const allChats = useMemo(
    () =>
      (conversationsQuery.data ?? []).map(
        (conversation): ChatRecord => ({
          id: conversation.id,
          name: conversation.name,
          initial: conversation.name.charAt(0).toUpperCase(),
          preview:
            conversation.lastMessage?.message ||
            (conversation.type === "group" ? t("groupReady") : ""),
          time: conversation.lastMessage?.timestamp
            ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" },
              )
            : "",
          unread: conversation.unreadCount > 0,
          tone: conversation.type === "group" ? "blue" : "violet",
          status:
            conversation.type === "group"
              ? t("memberCount", { count: conversation.memberCount })
              : conversation.members.find(
                  (member) => member.username === conversation.name,
                )?.email ?? conversation.name,
          imageDataUrl: conversation.imageUrl,
        }),
      ),
    [conversationsQuery.data, t],
  );
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

  useEffect(() => {
    const socket = chatSocketService.getSocket();
    const refreshConversations = () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.conversations.all,
      });
    };

    socket.on("conversation:updated", refreshConversations);
    socket.on("notification:new", refreshConversations);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("conversation:updated", refreshConversations);
      socket.off("notification:new", refreshConversations);
      chatSocketService.disconnect();
    };
  }, [queryClient]);

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
        {conversationsQuery.isLoading ? (
          <Typography as="p" variant="muted" className="py-8 text-center text-sm">
            {t("loadingChats")}
          </Typography>
        ) : null}
        {filteredChats.map((chat) => (
          <ChatRow key={chat.id} chat={chat} />
        ))}
        {!conversationsQuery.isLoading && filteredChats.length === 0 ? (
          <Typography as="p" variant="muted" className="py-8 text-center text-sm">
            {t("noConversations")}
          </Typography>
        ) : null}
      </div>

      <StartChatDialog />
    </section>
  );
}
