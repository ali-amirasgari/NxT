"use client";

import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  getChatById,
  initialMessages,
  type ChatMessage,
} from "@/components/page/chats/chat-data";
import { ChatAvatar } from "@/components/page/chats/chat-avatar";
import { ChatComposer } from "@/components/page/chats/chat-composer";
import { MessageBubble } from "@/components/page/chats/message-bubble";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function ChatDetailPage() {
  const t = useTranslations("app.chats");
  const params = useParams<{ chatId: string }>();
  const router = useRouter();
  const chat = getChatById(params.chatId) ?? getChatById("nima-goals")!;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

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
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <ChatComposer
        placeholder={t("writeMessage")}
        sendLabel={t("send")}
        attachLabel={t("attach")}
        onSend={(text) =>
          setMessages((current) => [
            ...current,
            {
              id: `message-${current.length + 1}`,
              text,
              sender: "me",
            },
          ])
        }
      />
    </section>
  );
}
