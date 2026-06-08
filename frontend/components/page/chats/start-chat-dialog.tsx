"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ChatAvatar } from "@/components/page/chats/chat-avatar";
import { chats } from "@/components/page/chats/chat-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Typography } from "@/components/ui/typography";

type StartChatDialogProps = {
  labels: {
    trigger: string;
    title: string;
    description: string;
    select: string;
    search: string;
    noResults: string;
  };
};

export function StartChatDialog({ labels }: StartChatDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase().replace(/^@/, "");

    return normalized
      ? chats.filter(
          (chat) =>
            chat.name.toLowerCase().includes(normalized) ||
            chat.id.toLowerCase().includes(normalized) ||
            chat.status.toLowerCase().includes(normalized),
        )
      : chats;
  }, [query]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          aria-label={labels.trigger}
          className="absolute end-1 bottom-5 size-12 rounded-full text-white shadow-[0_10px_28px_rgba(255,100,20,0.35)] md:end-0"
        >
          <Icon icon="solar:pen-new-square-linear" className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[350px] gap-4 rounded-3xl p-5">
        <DialogHeader className="pe-9">
          <DialogTitle className="text-xl font-bold">
            {labels.title}
          </DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-3">
          <InputGroup className="h-11 rounded-[14px] border-input bg-card shadow-none">
            <InputGroupAddon className="ps-3">
              <Icon
                icon="solar:magnifer-linear"
                className="size-4"
                aria-hidden="true"
              />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.search}
              aria-label={labels.search}
              className="text-sm"
            />
          </InputGroup>

          <div className="space-y-2">
            {filteredUsers.map((chat) => (
              <Button
                key={chat.id}
                type="button"
                variant="ghost"
                tone="neutral"
                className="flex h-auto w-full min-w-0 justify-start gap-3 rounded-2xl px-2 py-2.5 text-start"
                onClick={() => router.push(`/app/chats/${chat.id}`)}
              >
                <ChatAvatar chat={chat} className="size-10" />
                <span className="min-w-0 flex-1">
                  <Typography
                    as="span"
                    className="block truncate text-sm font-semibold"
                  >
                    {chat.name}
                  </Typography>
                  <Typography
                    as="span"
                    variant="muted"
                    className="block truncate text-xs"
                  >
                    @{chat.id} · {chat.status}
                  </Typography>
                </span>
                <span className="shrink-0 text-xs font-semibold text-primary">
                  {labels.select}
                </span>
              </Button>
            ))}
            {filteredUsers.length === 0 ? (
              <Typography
                as="p"
                variant="muted"
                className="py-8 text-center text-sm"
              >
                {labels.noResults}
              </Typography>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
