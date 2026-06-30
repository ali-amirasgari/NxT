"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { CommentsDrawer } from "@/components/global/comments-drawer";
import { ShareDrawer } from "@/components/global/share-drawer";
import { Button } from "@/components/ui/button";

type DetailActionsProps = {
  likeLabel: string;
  commentLabel: string;
  shareLabel: string;
  commentsOpen: boolean;
  onCommentsOpenChange: (open: boolean) => void;
  shareOpen: boolean;
  onShareOpenChange: (open: boolean) => void;
  shareUrl: string;
  postId?: number;
};

export function DetailActions({
  likeLabel,
  commentLabel,
  shareLabel,
  commentsOpen,
  onCommentsOpenChange,
  shareOpen,
  onShareOpenChange,
  shareUrl,
  postId,
}: DetailActionsProps) {
  const commentsT = useTranslations("app.comments");
  const shareT = useTranslations("app.share");
  const [liked, setLiked] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          tone={liked ? "primary" : "neutral"}
          size="icon"
          className="rounded-full"
          active={liked}
          onClick={() => setLiked((value) => !value)}
          aria-label={likeLabel}
        >
          <Icon
            icon={liked ? "solar:heart-bold" : "solar:heart-linear"}
            className="size-6"
            aria-hidden="true"
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          tone="neutral"
          size="icon"
          className="rounded-full"
          aria-label={commentLabel}
          aria-expanded={commentsOpen}
          onClick={() => onCommentsOpenChange(true)}
        >
          <Icon
            icon="solar:chat-round-line-linear"
            className="size-5"
            aria-hidden="true"
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          tone="neutral"
          size="icon"
          className="rounded-full"
          aria-label={shareLabel}
          aria-expanded={shareOpen}
          onClick={() => onShareOpenChange(true)}
        >
          <Icon
            icon="solar:plain-linear"
            className="size-5"
            aria-hidden="true"
          />
        </Button>
      </div>

      <CommentsDrawer
        open={commentsOpen}
        onOpenChange={onCommentsOpenChange}
        postId={postId}
        labels={{
          title: commentsT("title"),
          description: commentsT("description"),
          replies: commentsT("replies"),
          placeholder: commentsT("placeholder"),
          send: commentsT("send"),
          reply: commentsT("reply"),
          like: commentsT("like"),
          added: commentsT("added"),
          loading: commentsT("loading"),
          empty: commentsT("empty"),
          error: commentsT("error"),
        }}
      />
      <ShareDrawer
        open={shareOpen}
        onOpenChange={onShareOpenChange}
        shareUrl={shareUrl}
        labels={{
          title: shareT("title"),
          description: shareT("description"),
          search: shareT("search"),
          send: shareT("send"),
          sent: shareT("sent"),
          copy: shareT("copy"),
          copied: shareT("copied"),
          prompt: shareT("prompt"),
          loading: shareT("loading"),
          empty: shareT("empty"),
        }}
      />
    </>
  );
}
