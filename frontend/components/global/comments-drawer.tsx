"use client";

import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";

import {
  detailComments,
  type DetailComment,
} from "@/components/global/detail-social-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const avatarTones: Record<DetailComment["tone"], string> = {
  green: "bg-emerald-400 text-white",
  orange: "bg-orange-500 text-white",
  violet: "bg-violet-500 text-white",
};

type CommentsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: {
    title: string;
    description: string;
    replies: string;
    placeholder: string;
    send: string;
    reply: string;
    like: string;
    added: string;
  };
};

export function CommentsDrawer({
  open,
  onOpenChange,
  labels,
}: CommentsDrawerProps) {
  const [comments, setComments] = useState(detailComments);
  const [comment, setComment] = useState("");
  const [announcement, setAnnouncement] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = comment.trim();

    if (!value) {
      return;
    }

    setComments((current) => [
      ...current,
      {
        id: `comment-${current.length + 1}`,
        author: "Alex Carter",
        initial: "A",
        text: value,
        timestamp: "now",
        tone: "orange",
      },
    ]);
    setComment("");
    setAnnouncement(labels.added);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto h-[590px] max-h-[70vh] w-full max-w-[390px] rounded-t-[28px] border border-primary/40 bg-card shadow-[0_-10px_24px_rgba(0,0,0,0.32)]">
        <DrawerHeader className="flex-row items-center justify-between px-6 pb-2 pt-3 text-start">
          <div>
            <DrawerTitle className="text-xl font-bold">
              {labels.title}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              {labels.description}
            </DrawerDescription>
          </div>
          <Typography as="span" variant="muted" className="text-xs">
            {labels.replies}
          </Typography>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-24 pt-2">
          <div className="space-y-5">
            {comments.map((item) => (
              <article key={item.id} className="flex gap-3">
                <Avatar className="size-9">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-bold",
                      avatarTones[item.tone],
                    )}
                  >
                    {item.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <Typography as="h3" className="text-[13px] font-semibold">
                      {item.author}
                    </Typography>
                    <Typography
                      as="span"
                      variant="muted"
                      className="text-[11px]"
                    >
                      {item.timestamp}
                    </Typography>
                  </div>
                  <Typography
                    as="p"
                    variant="muted"
                    className="mt-1 text-[13px] leading-[17px]"
                  >
                    {item.text}
                  </Typography>
                  <div className="mt-1.5 flex gap-3">
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="h-auto p-0 text-[11px]"
                    >
                      {labels.reply}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="h-auto p-0 text-[11px]"
                    >
                      {labels.like}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="absolute inset-x-5 bottom-9"
        >
          <InputGroup className="h-12 rounded-2xl border-primary/40 bg-muted shadow-none">
            <InputGroupInput
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              aria-label={labels.placeholder}
              placeholder={labels.placeholder}
              className="px-4 text-sm"
            />
            <InputGroupButton
              type="submit"
              size="icon-sm"
              disabled={!comment.trim()}
              aria-label={labels.send}
              className="me-2 size-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Icon
                icon="solar:arrow-right-up-linear"
                className="size-4"
                aria-hidden="true"
              />
            </InputGroupButton>
          </InputGroup>
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
