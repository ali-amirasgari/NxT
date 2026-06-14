"use client";

import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import { useConversationDetailQuery } from "@/apis/queries/chat/queries";
import chatSocketService from "@/apis/services/chatSocketService";
import type {
  ChatSocketError,
  ChatSocketMessage,
  ChatSocketUser,
  DeleteMessagePayload,
} from "@/apis/types/chat";
import type { ChatRecord } from "@/components/page/chats/chat-data";
import { ChatAvatar } from "@/components/page/chats/chat-avatar";
import { ChatComposer } from "@/components/page/chats/chat-composer";
import { MessageBubble } from "@/components/page/chats/message-bubble";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
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
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatSocketMessage[]>([]);
  const [socketUser, setSocketUser] = useState<ChatSocketUser>();
  const [socketError, setSocketError] = useState("");
  const conversationQuery = useConversationDetailQuery(chatId);
  const chat = useMemo<ChatRecord>(() => {
    const conversation = conversationQuery.data;
    const name = conversation?.name ?? t("loadingChats");
    const adminCount =
      conversation?.members.filter(
        (member) => member.role === "admin" || member.role === "owner",
      ).length ?? 0;

    return {
      id: chatId,
      name,
      initial: name.charAt(0).toUpperCase(),
      preview: conversation?.lastMessage?.message ?? "",
      time: "",
      unread: false,
      tone: conversation?.type === "group" ? "blue" : "violet",
      status:
        conversation?.type === "group"
          ? `${t("memberCount", { count: conversation.memberCount })} · ${t("adminCount", { count: adminCount })}`
          : conversation?.members.find(
              (member) => member.userId !== socketUser?.id,
            )?.email ?? "",
      imageDataUrl: conversation?.imageUrl,
    };
  }, [chatId, conversationQuery.data, socketUser?.id, t]);
  useEffect(() => {
    const socket = chatSocketService.getSocket();
    const handleAuthenticated = (user: ChatSocketUser) => {
      setSocketUser(user);
      setSocketError("");
    };
    const handleSocketError = (error: ChatSocketError) => {
      setSocketError(error.message);
    };
    const handleConnectionError = (
      error: Error & { data?: { code?: string } },
    ) => {
      const isUnauthorized =
        error.data?.code === "UNAUTHORIZED" ||
        error.message === "Unauthorized" ||
        error.message === "Authentication required" ||
        error.message === "Authentication failed";

      if (isUnauthorized) {
        return;
      }

      setSocketError(error.message);
    };
    const handleHistory = (history: ChatSocketMessage[]) => {
      setMessages(history);
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.conversations.all,
      });
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
    const handleConversationUpdated = () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.conversations.all,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.conversations.detail(chatId),
      });
    };

    socket.on("authenticated", handleAuthenticated);
    socket.on("socket_error", handleSocketError);
    socket.on("connect_error", handleConnectionError);
    socket.on("connect", joinRoom);
    socket.on("room_history", handleHistory);
    socket.on("newMessage", handleNewMessage);
    socket.on("message_edited", handleUpdatedMessage);
    socket.on("message_deleted", handleDeletedMessage);
    socket.on("message_reaction_updated", handleUpdatedMessage);
    socket.on("message_pinned", handleUpdatedMessage);
    socket.on("conversation:updated", handleConversationUpdated);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("authenticated", handleAuthenticated);
      socket.off("socket_error", handleSocketError);
      socket.off("connect_error", handleConnectionError);
      socket.off("connect", joinRoom);
      socket.off("room_history", handleHistory);
      socket.off("newMessage", handleNewMessage);
      socket.off("message_edited", handleUpdatedMessage);
      socket.off("message_deleted", handleDeletedMessage);
      socket.off("message_reaction_updated", handleUpdatedMessage);
      socket.off("message_pinned", handleUpdatedMessage);
      socket.off("conversation:updated", handleConversationUpdated);
      chatSocketService.disconnect();
    };
  }, [chatId, queryClient, router]);

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
            mine={
              message.userId
                ? message.userId === socketUser?.id
                : message.user === socketUser?.username
            }
            downloadLabel={t("downloadAttachment")}
            reactions={message.reactions}
            currentUser={socketUser?.id ?? ""}
            reactionLabel={t("addReaction")}
            onReact={(emoji) =>
              chatSocketService.addReaction({
                room: chatId,
                messageId: message._id,
                emoji,
              })
            }
            time={new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        ))}
      </div>

      {socketError ? (
        <Typography as="p" className="mb-2 text-center text-xs text-destructive">
          {socketError}
        </Typography>
      ) : null}

      <ChatComposer
        placeholder={t("writeMessage")}
        sendLabel={t("send")}
        attachLabel={t("attach")}
        removeAttachmentLabel={t("removeAttachment")}
        invalidAttachmentLabel={t("invalidAttachment")}
        attachmentTooLargeLabel={t("attachmentTooLarge")}
        onSend={(message) =>
          chatSocketService.sendMessage({
            room: chatId,
            message,
          })
        }
        onSendAttachment={(attachment) =>
          chatSocketService.uploadImage({
            room: chatId,
            imageUrl: attachment.dataUrl,
            message: attachment.name,
          })
        }
      />
    </section>
  );
}
