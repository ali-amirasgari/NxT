"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMeQuery } from "@/apis/queries/users/queries";
import { usePostQuery } from "@/apis/queries/social/queries";
import { resolveDisplayName, userInitial } from "@/lib/user-display";
import { DetailActions } from "@/components/global/detail-actions";
import { DetailAuthorRow } from "@/components/global/detail-author-row";
import { ContentOptionsMenu } from "@/components/global/content-options-menu";
import { DetailPageHeader } from "@/components/global/detail-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const mediaToneClasses = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  muted: "bg-muted text-foreground",
  card: "bg-card text-foreground",
} as const;

export default function PostDetailPage() {
  const t = useTranslations("app.details");
  const params = useParams<{ postId: string }>();
  const searchParams = useSearchParams();
  const { data: post, isLoading, isError } = usePostQuery(params.postId);
  const { data: me } = useMeQuery();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const fromExplore = searchParams.get("from") === "explore";

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
        <div className="flex h-[70px] items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-[360px] w-full rounded-3xl" />
          <Skeleton className="h-9 w-32" />
        </div>
      </section>
    );
  }

  if (isError || !post) {
    return (
      <section className="mx-auto flex w-full max-w-[390px] flex-col items-center gap-3 px-1 pt-20 text-center md:max-w-3xl">
        <Typography as="p" className="text-sm text-muted-foreground">
          {t("notFound")}
        </Typography>
        <Button asChild variant="outline" tone="neutral">
          <Link href="/app/explore">{t("back")}</Link>
        </Button>
      </section>
    );
  }

  const isOwner = me ? post.author.id === me.id : !fromExplore;
  const authorName = resolveDisplayName(post.author);

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
      <DetailPageHeader
        title={t("postTitle")}
        backLabel={t("back")}
        moreLabel={t("more")}
        menu={
          <ContentOptionsMenu
            type="post"
            id={String(post.id)}
            owner={isOwner}
            onShare={() => setShareOpen(true)}
          />
        }
      />

      <div className="space-y-4 pt-1">
        <DetailAuthorRow
          initial={userInitial(post.author)}
          name={authorName}
          meta={post.goal?.title ?? t("postTitle")}
          href={
            fromExplore
              ? `/app/users/${post.author.id}?from=explore`
              : undefined
          }
        />

        <Card
          className={cn(
            "h-[360px] justify-end gap-0 rounded-3xl border-0 py-0 shadow-none ring-0",
            mediaToneClasses[post.media_tone],
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
            {post.goal?.title ? (
              <Typography as="p" className="mt-2 text-sm opacity-80">
                {post.goal.title}
              </Typography>
            ) : null}
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
          postId={post.id}
        />

        <div className="space-y-2">
          <Typography as="p" variant="small" className="text-sm">
            {t("likes", { count: post.likes_count })}
          </Typography>
          {post.caption ? (
            <Typography as="p" className="text-sm leading-5">
              <Typography
                as="span"
                variant="small"
                className="me-1.5 inline text-sm font-semibold"
              >
                {authorName}
              </Typography>
              {post.caption}
            </Typography>
          ) : null}
          <Button
            type="button"
            variant="link"
            tone="neutral"
            className="h-auto justify-start p-0 text-sm font-normal text-muted-foreground"
            onClick={() => setCommentsOpen(true)}
          >
            {t("comments", { count: post.comments_count })}
          </Button>
        </div>
      </div>
    </section>
  );
}
