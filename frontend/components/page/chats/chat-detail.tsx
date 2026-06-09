"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import chatSocketService from "@/apis/services/chatSocketService";
import type {
  ChatSocketMessage,
  DeleteMessagePayload,
} from "@/apis/types/chat";
import type { ChatRecord } from "@/components/page/chats/chat-data";
import { ChatAvatar } from "@/components/page/chats/chat-avatar";
import { ChatComposer } from "@/components/page/chats/chat-composer";
import { getChatById } from "@/components/page/chats/chat-data";
import { MessageBubble } from "@/components/page/chats/message-bubble";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  getGroupChatsServerSnapshot,
  getGroupChatsSnapshot,
  parseGroupChats,
  subscribeToGroupChats,
} from "@/lib/group-chat-storage";
import {
  getProfileServerSnapshot,
  getProfileSnapshot,
  parseProfile,
  subscribeToProfile,
} from "@/lib/profile-storage";

function replaceMessage(
  messages: ChatSocketMessage[],
  updatedMessage: ChatSocketMessage,
) {
  return messages.map((message) =>
    message._id === updatedMessage._id ? updatedMessage : message,
  );
}

export function ChatDetail({ chatId }: { chatId: string }) {
  const t = useTranslations("app.chats");
  const router = useRouter();
  const [messages, setMessages] = useState<ChatSocketMessage[]>([]);
  const groupChatsSnapshot = useSyncExternalStore(
    subscribeToGroupChats,
    getGroupChatsSnapshot,
    getGroupChatsServerSnapshot,
  );
  const group = useMemo(
    () => parseGroupChats(groupChatsSnapshot).find((item) => item.id === chatId),
    [chatId, groupChatsSnapshot],
  );
  const chat = useMemo<ChatRecord>(() => {
    if (group) {
      const adminCount = group.members.filter(
        (member) => member.role === "admin",
      ).length;

      return {
        id: group.id,
        name: group.name,
        initial: group.name.charAt(0).toUpperCase(),
        preview: t("groupReady"),
        time: "",
        unread: false,
        tone: "blue",
        status: `${t("memberCount", { count: group.members.length })} · ${t("adminCount", { count: adminCount })}`,
        imageDataUrl: group.imageDataUrl,
      };
    }

    return getChatById(chatId) ?? getChatById("nima-goals")!;
  }, [chatId, group, t]);
  const profileSnapshot = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getProfileServerSnapshot,
  );
  const profile = useMemo(() => parseProfile(profileSnapshot), [profileSnapshot]);
  const currentUser = profile.username.replace(/^@/, "");

  useEffect(() => {
    const socket = chatSocketService.connect();

    const handleHistory = (history: ChatSocketMessage[]) => {
      setMessages(history);
    };
    const handleNewMessage = (message: ChatSocketMessage) => {
      if (message.room !== chatId) return;
      setMessages((current) =>
        current.some((item) => item._id === message._id)
          ? current
          : [...current, message],
      );
    };
    const handleUpdatedMessage = (message: ChatSocketMessage) => {
      if (message.room !== chatId) return;
      setMessages((current) => replaceMessage(current, message));
    };
    const handleDeletedMessage = ({
      messageId,
      room,
    }: DeleteMessagePayload) => {
      if (room !== chatId) return;
      setMessages((current) =>
        current.filter((message) => message._id !== messageId),
      );
    };
    const joinRoom = () => chatSocketService.joinRoom(chatId);

    socket.on("connect", joinRoom);
    socket.on("room_history", handleHistory);
    socket.on("newMessage", handleNewMessage);
    socket.on("message_edited", handleUpdatedMessage);
    socket.on("message_deleted", handleDeletedMessage);
    socket.on("message_reaction_updated", handleUpdatedMessage);
    socket.on("message_pinned", handleUpdatedMessage);

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("room_history", handleHistory);
      socket.off("newMessage", handleNewMessage);
      socket.off("message_edited", handleUpdatedMessage);
      socket.off("message_deleted", handleDeletedMessage);
      socket.off("message_reaction_updated", handleUpdatedMessage);
      socket.off("message_pinned", handleUpdatedMessage);
      chatSocketService.disconnect();
    };
  }, [chatId]);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-108px)] w-full max-w-[390px] flex-col px-1 md:max-w-3xl">
      <header className="-mx-5 flex h-[73px] items-center border-b bg-background px-5">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          tone="neutral"
          aria-label={t("back")}
          onClick={() => router.push("/app/chats")}
          className="size-9 rounded-full bg-muted"
        >
          <Icon icon="solar:alt-arrow-left-linear" className="size-5" />
        </Button>
        <ChatAvatar chat={chat} className="ms-3 size-[42px]" />
        <div className="ms-3 min-w-0 flex-1">
          <Typography as="h1" className="truncate text-lg font-bold">
            {chat.name}
          </Typography>
          <Typography
            as="p"
            variant="muted"
            className="truncate text-xs leading-4"
          >
            {chat.status}
          </Typography>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          tone="neutral"
          aria-label={t("more")}
          className="size-9 rounded-full"
        >
          <Icon icon="solar:menu-dots-bold" className="size-5" />
        </Button>
      </header>

      <div
        className="flex flex-1 flex-col gap-[10px] overflow-y-auto pb-5 pt-[43px]"
        aria-live="polite"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            text={message.message}
            imageUrl={message.imageUrl}
            mine={message.user === currentUser}
            reactions={message.reactions}
            currentUser={currentUser}
            reactionLabel={t("addReaction")}
            onReact={(emoji) =>
              chatSocketService.addReaction({
                room: chatId,
                messageId: message._id,
                emoji,
                user: currentUser,
              })
            }
            time={new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        ))}
      </div>

      <ChatComposer
        placeholder={t("writeMessage")}
        sendLabel={t("send")}
        attachLabel={t("attach")}
        onSend={(message) =>
          chatSocketService.sendMessage({
            room: chatId,
            user: currentUser,
            message,
          })
        }
      />
    </section>
  );
}
