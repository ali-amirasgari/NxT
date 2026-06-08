"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { chats } from "@/components/page/chats/chat-data";
import { ChatRow } from "@/components/page/chats/chat-row";
import { StartChatDialog } from "@/components/page/chats/start-chat-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Typography } from "@/components/ui/typography";

export default function ChatsPage() {
  const t = useTranslations("app.chats");
  const [query, setQuery] = useState("");
  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? chats.filter(
          (chat) =>
            chat.name.toLowerCase().includes(normalized) ||
            chat.preview.toLowerCase().includes(normalized),
        )
      : chats;
  }, [query]);

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-128px)] w-full max-w-[390px] flex-col px-1 md:max-w-3xl">
      <header className="flex h-[60px] items-center">
        <Typography as="h1" className="text-[22px] font-bold">
          {t("title")}
        </Typography>
      </header>

      <InputGroup className="mt-4 h-11 rounded-[14px] border-input bg-card shadow-none">
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

      <StartChatDialog
        labels={{
          trigger: t("start"),
          title: t("startTitle"),
          description: t("startDescription"),
          select: t("select"),
          search: t("searchUsers"),
          noResults: t("noUsers"),
        }}
      />
    </section>
  );
}
