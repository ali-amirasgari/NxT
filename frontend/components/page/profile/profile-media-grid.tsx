"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

import { ContentOptionsMenu } from "@/components/global/content-options-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useContent } from "@/hooks/use-content";

const goalSurfaces = [
  "bg-secondary text-secondary-foreground",
  "bg-primary text-primary-foreground",
  "bg-muted text-foreground",
] as const;

const postSurfaces = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  muted: "bg-muted text-foreground",
} as const;

export function ProfileMediaGrid({
  tab,
  readonly = false,
}: {
  tab: "goals" | "shared";
  readonly?: boolean;
}) {
  const { goals, posts } = useContent();

  if (tab === "goals") {
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
                    {goal.progress ? `${goal.progress}%` : goal.category}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
            {!readonly ? (
              <ContentOptionsMenu
                type="goal"
                id={goal.id}
                goal={goal}
                triggerClassName="absolute end-1.5 top-1.5 size-8 bg-background/20 text-current hover:bg-background/30"
              />
            ) : null}
          </div>
        ))}
      </div>
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
              className={`relative h-[110px] rounded-none border-0 py-0 shadow-none ring-0 md:rounded-2xl ${postSurfaces[post.mediaTone]}`}
            >
              <Icon
                icon={index % 3 === 0 ? "solar:videocamera-record-linear" : "solar:gallery-linear"}
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
