import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import type { ChatMessage } from "./chat-data";

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.kind === "bet") {
    return (
      <div className="w-[250px] rounded-2xl border border-input bg-muted px-[17px] py-3">
        <Typography as="p" className="text-[13px] font-semibold">
          Bet challenge
        </Typography>
        <Typography
          as="p"
          variant="muted"
          className="mt-1 text-[11px] leading-[14px]"
        >
          {message.text}
        </Typography>
      </div>
    );
  }

  const mine = message.sender === "me";

  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[260px] rounded-[18px] px-[13px] py-[7px] text-sm leading-[17px]",
          mine
            ? "bg-primary text-primary-foreground"
            : "border border-input bg-card text-card-foreground",
        )}
      >
        {message.text}
      </div>
      {message.time ? (
        <Typography
          as="span"
          variant="muted"
          className="mt-1 px-1 text-[10px] leading-3"
        >
          {message.time}
        </Typography>
      ) : null}
    </div>
  );
}
