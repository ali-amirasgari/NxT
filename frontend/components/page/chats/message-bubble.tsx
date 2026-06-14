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
  downloadLabel,
  reactions,
  currentUser,
  reactionLabel,
  onReact,
}: {
  text: string;
  imageUrl?: string;
  mine: boolean;
  time?: string;
  downloadLabel: string;
  reactions?: Record<string, string[]>;
  currentUser: string;
  reactionLabel: string;
  onReact: (emoji: string) => void;
}) {
  const visibleReactions = Object.entries(reactions ?? {}).filter(
    ([, users]) => users.length > 0,
  );
  const attachmentMimeType = imageUrl?.startsWith("data:")
    ? imageUrl.slice(5, imageUrl.indexOf(";"))
    : undefined;
  const isDocument =
    attachmentMimeType === "application/pdf" ||
    attachmentMimeType === "application/vnd.ms-excel" ||
    attachmentMimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const isImage =
    Boolean(imageUrl) &&
    (!attachmentMimeType || attachmentMimeType.startsWith("image/"));

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
          {imageUrl && isImage ? (
            // The chat service accepts arbitrary external attachment hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="mb-2 max-h-64 w-full rounded-xl object-cover"
            />
          ) : null}
          {imageUrl && isDocument ? (
            <a
              href={imageUrl}
              download={text}
              className={cn(
                "flex min-w-52 items-center gap-3 rounded-xl p-2 no-underline",
                mine ? "bg-primary-foreground/10" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  mine
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                <Icon
                  icon={
                    attachmentMimeType === "application/pdf"
                      ? "solar:file-text-bold"
                      : "solar:document-bold"
                  }
                  className="size-5"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{text}</span>
                <span className="block text-[10px] opacity-75">
                  {downloadLabel}
                </span>
              </span>
              <Icon icon="solar:download-linear" className="size-4 shrink-0" />
            </a>
          ) : (
            text
          )}
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
