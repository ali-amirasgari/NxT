"use client";

import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import {
  useCommentsQuery,
  useCreateCommentMutation,
} from "@/apis/queries/social/queries";
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
import { resolveDisplayName, userInitial } from "@/lib/user-display";

/** Short, locale-light relative time for comment timestamps. */
function formatRelativeTime(value: string): string {
  const then = new Date(value).getTime();

  if (Number.isNaN(then)) {
    return "";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 60) {
    return "now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }

  return new Date(then).toLocaleDateString();
}

type CommentsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: number;
  labels: {
    title: string;
    description: string;
    replies: string;
    placeholder: string;
    send: string;
    reply: string;
    like: string;
    added: string;
    loading: string;
    empty: string;
    error: string;
  };
};

export function CommentsDrawer({
  open,
  onOpenChange,
  postId,
  labels,
}: CommentsDrawerProps) {
  const [comment, setComment] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const commentsQuery = useCommentsQuery(postId);
  const createComment = useCreateCommentMutation(postId ?? 0);

  const comments = commentsQuery.data ?? [];
  const isLoading = Boolean(postId) && commentsQuery.isLoading;
  const isEmpty = !isLoading && comments.length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = comment.trim();

    if (!value || !postId) {
      return;
    }

    createComment.mutate(
      { body: value },
      {
        onSuccess: () => {
          setComment("");
          setAnnouncement(labels.added);
        },
        onError: () => {
          toast.error(labels.error);
        },
      },
    );
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
          {isLoading ? (
            <Typography
              as="p"
              variant="muted"
              className="py-10 text-center text-sm"
            >
              {labels.loading}
            </Typography>
          ) : null}

          {isEmpty ? (
            <Typography
              as="p"
              variant="muted"
              className="py-10 text-center text-sm"
            >
              {labels.empty}
            </Typography>
          ) : null}

          {!isLoading && comments.length > 0 ? (
            <div className="space-y-5">
              {comments.map((item) => (
                <article key={item.id} className="flex gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                      {userInitial(item.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Typography as="h3" className="text-[13px] font-semibold">
                        {resolveDisplayName(item.author)}
                      </Typography>
                      <Typography
                        as="span"
                        variant="muted"
                        className="text-[11px]"
                      >
                        {formatRelativeTime(item.created_at)}
                      </Typography>
                    </div>
                    <Typography
                      as="p"
                      variant="muted"
                      className="mt-1 text-[13px] leading-[17px]"
                    >
                      {item.body}
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
          ) : null}
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
              disabled={!postId}
              className="px-4 text-sm"
            />
            <InputGroupButton
              type="submit"
              size="icon-sm"
              disabled={!comment.trim() || !postId || createComment.isPending}
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
