"use client";

import { Icon } from "@iconify/react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DetailActions } from "@/components/global/detail-actions";
import { DetailAuthorRow } from "@/components/global/detail-author-row";
import { ContentOptionsMenu } from "@/components/global/content-options-menu";
import { DetailPageHeader } from "@/components/global/detail-page-header";
import { getUserIdByName } from "@/components/global/users-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useContent } from "@/hooks/use-content";

const mediaToneClasses = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  muted: "bg-muted text-foreground",
} as const;

export default function PostDetailPage() {
  const t = useTranslations("app.details");
  const params = useParams<{ postId: string }>();
  const searchParams = useSearchParams();
  const { posts } = useContent();
  const post = posts.find((item) => item.id === params.postId);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  if (!post) return null;

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
      <DetailPageHeader
        title={t("postTitle")}
        backLabel={t("back")}
        moreLabel={t("more")}
        menu={
          <ContentOptionsMenu
            type="post"
            id={post.id}
            owner={searchParams.get("from") !== "explore"}
            onShare={() => setShareOpen(true)}
          />
        }
      />

      <div className="space-y-4 pt-1">
        <DetailAuthorRow
          initial={post.authorInitial}
          name={post.author}
          meta={post.meta}
          href={
            searchParams.get("from") === "explore"
              ? `/app/users/${getUserIdByName(post.author)}?from=explore`
              : undefined
          }
        />

        <Card
          className={cn(
            "h-[360px] justify-end gap-0 rounded-3xl border-0 py-0 shadow-none ring-0",
            mediaToneClasses[post.mediaTone],
          )}
        >
          <CardContent className="p-7">
            <Icon
              icon="solar:gallery-wide-bold"
              className="size-8 opacity-70"
              aria-hidden="true"
            />
            <Typography
              as="h2"
              variant="h3"
              className="mt-4 border-0 pb-0 text-2xl font-extrabold tracking-[-0.03em]"
            >
              {post.title}
            </Typography>
            <Typography as="p" className="mt-2 text-sm opacity-80">
              {post.meta}
            </Typography>
          </CardContent>
        </Card>

        <DetailActions
          likeLabel={t("like")}
          commentLabel={t("comment")}
          shareLabel={t("share")}
          commentsOpen={commentsOpen}
          onCommentsOpenChange={setCommentsOpen}
          shareOpen={shareOpen}
          onShareOpenChange={setShareOpen}
          shareUrl={`/app/posts/${post.id}`}
        />

        <div className="space-y-2">
          <Typography as="p" variant="small" className="text-sm">
            {post.likes}
          </Typography>
          <Typography as="p" className="text-sm leading-5">
            <Typography
              as="span"
              variant="small"
              className="me-1.5 inline text-sm font-semibold"
            >
              {post.author}
            </Typography>
            {post.caption}
          </Typography>
          <Button
            type="button"
            variant="link"
            tone="neutral"
            className="h-auto justify-start p-0 text-sm font-normal text-muted-foreground"
            onClick={() => setCommentsOpen(true)}
          >
            {post.comments}
          </Button>
          <Typography
            as="p"
            variant="muted"
            className="text-[11px] uppercase tracking-wide"
          >
            {post.timestamp}
          </Typography>
        </div>
      </div>
    </section>
  );
}
