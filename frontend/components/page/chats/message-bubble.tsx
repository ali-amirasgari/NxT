"use client";

import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

export function MessageBubble({
  text,
  imageUrl,
  mine,
  time,
  reactions,
  currentUser,
  reactionLabel,
  onReact,
}: {
  text: string;
  imageUrl?: string;
  mine: boolean;
  time?: string;
  reactions?: Record<string, string[]>;
  currentUser: string;
  reactionLabel: string;
  onReact: (emoji: string) => void;
}) {
  const visibleReactions = Object.entries(reactions ?? {}).filter(
    ([, users]) => users.length > 0,
  );

  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "group/message flex items-end gap-1",
          mine && "flex-row-reverse",
        )}
      >
        <div
          className={cn(
            "max-w-[260px] rounded-[18px] px-[13px] py-[7px] text-sm leading-[17px]",
            mine
              ? "bg-primary text-primary-foreground"
              : "border border-input bg-card text-card-foreground",
          )}
        >
          {imageUrl ? (
            // The chat service accepts arbitrary external attachment hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="mb-2 max-h-64 w-full rounded-xl object-cover"
            />
          ) : null}
          {text}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              tone="neutral"
              aria-label={reactionLabel}
              className="size-7 rounded-full text-muted-foreground opacity-70 hover:opacity-100 md:opacity-0 md:group-hover/message:opacity-100 md:focus-visible:opacity-100"
            >
              <Icon icon="solar:smile-circle-linear" className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align={mine ? "end" : "start"}
            className="w-auto flex-row gap-1 rounded-full p-1.5"
          >
            {QUICK_REACTIONS.map((emoji) => {
              const selected = reactions?.[emoji]?.includes(currentUser);

              return (
                <Button
                  key={emoji}
                  type="button"
                  size="icon-sm"
                  variant={selected ? "secondary" : "ghost"}
                  tone="neutral"
                  disabled={selected}
                  aria-label={`${reactionLabel} ${emoji}`}
                  onClick={() => onReact(emoji)}
                  className="size-8 rounded-full text-base"
                >
                  {emoji}
                </Button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      {visibleReactions.length > 0 ? (
        <div className={cn("mt-1 flex flex-wrap gap-1", mine && "justify-end")}>
          {visibleReactions.map(([emoji, users]) => (
            <Button
              key={emoji}
              type="button"
              size="xs"
              variant={users.includes(currentUser) ? "secondary" : "outline"}
              tone="neutral"
              disabled={users.includes(currentUser)}
              aria-label={`${reactionLabel} ${emoji}`}
              onClick={() => onReact(emoji)}
              className="h-6 rounded-full px-2 text-xs"
            >
              <span>{emoji}</span>
              <span>{users.length}</span>
            </Button>
          ))}
        </div>
      ) : null}

      {time ? (
        <Typography
          as="span"
          variant="muted"
          className="mt-1 px-1 text-[10px] leading-3"
        >
          {time}
        </Typography>
      ) : null}
    </div>
  );
}
