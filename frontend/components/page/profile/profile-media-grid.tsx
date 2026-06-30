"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { useGoalsQuery } from "@/apis/queries/goals/queries";
import { usePostsQuery } from "@/apis/queries/social/queries";
import { useMeQuery } from "@/apis/queries/users/queries";
import type { PostMediaTone } from "@/apis/types/social";
import { ContentOptionsMenu } from "@/components/global/content-options-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

const goalSurfaces = [
  "bg-secondary text-secondary-foreground",
  "bg-primary text-primary-foreground",
  "bg-muted text-foreground",
] as const;

const postSurfaces: Record<PostMediaTone, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  muted: "bg-muted text-foreground",
  card: "bg-card text-card-foreground",
};

export function ProfileMediaGrid({
  tab,
  readonly = false,
  userId,
}: {
  tab: "goals" | "shared";
  readonly?: boolean;
  userId?: number;
}) {
  const t = useTranslations("app.profile");
  const meQuery = useMeQuery();
  const authorId = userId ?? meQuery.data?.id;

  const goalsQuery = useGoalsQuery();
  const postsQuery = usePostsQuery(
    authorId ? { author_id: authorId } : undefined,
  );

  if (tab === "goals") {
    const goals = goalsQuery.data ?? [];

    if (goalsQuery.isLoading) {
      return (
        <div className="grid grid-cols-2 gap-0.5 bg-background md:gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[110px] rounded-none md:rounded-2xl" />
          ))}
        </div>
      );
    }

    if (goals.length === 0) {
      return (
        <Typography as="p" variant="muted" className="py-12 text-center text-sm">
          {t("emptyGoals")}
        </Typography>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-0.5 bg-background md:gap-3">
        {goals.map((goal, index) => (
          <div key={goal.id} className="relative">
            <Link
              href={`/app/goals/${goal.id}`}
              aria-label={`Open ${goal.title} goal`}
              className="block rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:rounded-2xl"
            >
              <Card
                className={`h-[110px] justify-end gap-0 rounded-none border-0 py-0 shadow-none ring-0 md:rounded-2xl ${goalSurfaces[index % goalSurfaces.length]}`}
              >
                <CardContent className="px-3 py-3">
                  <Typography as="h3" variant="small" className="line-clamp-1 text-sm">
                    {goal.title}
                  </Typography>
                  <Typography as="p" className="mt-1 text-xs opacity-70">
                    {goal.progress ? `${goal.progress}%` : goal.category?.name}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
            {!readonly ? (
              <ContentOptionsMenu
                type="goal"
                id={String(goal.id)}
                goal={goal}
                triggerClassName="absolute end-1.5 top-1.5 size-8 bg-background/20 text-current hover:bg-background/30"
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  const posts = postsQuery.data ?? [];

  if (postsQuery.isLoading) {
    return (
      <div className="grid grid-cols-3 gap-0.5 bg-background md:gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[110px] rounded-none md:rounded-2xl" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Typography as="p" variant="muted" className="py-12 text-center text-sm">
        {t("emptyShared")}
      </Typography>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 bg-background md:gap-3">
      {posts.map((post, index) => (
        <div key={post.id}>
          <Link
            href={`/app/posts/${post.id}`}
            aria-label={`Open ${post.title}`}
            className="block rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:rounded-2xl"
          >
            <Card
              className={`relative h-[110px] rounded-none border-0 py-0 shadow-none ring-0 md:rounded-2xl ${postSurfaces[post.media_tone]}`}
            >
              <Icon
                icon={
                  post.media_type === "video"
                    ? "solar:videocamera-record-linear"
                    : "solar:gallery-linear"
                }
                aria-hidden="true"
                className="absolute end-2.5 top-2.5 size-4"
              />
              <div className="absolute bottom-2.5 start-2.5 h-[22px] w-[70%] rounded-lg bg-background/20" />
            </Card>
          </Link>
        </div>
      ))}
    </div>
  );
}
