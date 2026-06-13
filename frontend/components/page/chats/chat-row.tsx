import Link from "next/link";

import { Typography } from "@/components/ui/typography";

import { ChatAvatar } from "./chat-avatar";
import type { ChatRecord } from "./chat-data";

export function ChatRow({ chat }: { chat: ChatRecord }) {
  return (
    <Link
      href={`/app/chats/${chat.id}`}
      className="flex h-[58px] items-center rounded-xl px-0 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChatAvatar chat={chat} />
      <div className="ms-3 min-w-0 flex-1">
        <Typography
          as="p"
          className="truncate text-base font-semibold leading-5"
        >
          {chat.name}
        </Typography>
        <Typography
          as="p"
          variant="muted"
          className="mt-1 truncate text-[13px] leading-[17px]"
        >
          {chat.preview}
        </Typography>
      </div>
      <div className="ms-2 flex h-full w-8 shrink-0 flex-col items-end pt-1">
        <Typography as="span" variant="muted" className="text-xs">
          {chat.time}
        </Typography>
        {chat.unread ? (
          <span
            className="mt-3 size-2 rounded-full bg-primary"
            aria-label="Unread"
          />
        ) : null}
      </div>
    </Link>
  );
}
