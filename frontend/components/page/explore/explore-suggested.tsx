"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

import type { SuggestedCategory } from "@/apis/types/category";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

type ExploreSuggestedProps = {
  data: SuggestedCategory[];
  title: string;
  postsLabel: string;
  goalsLabel: string;
  emptyLabel: string;
};

export function ExploreSuggested({
  data,
  title,
  postsLabel,
  goalsLabel,
  emptyLabel,
}: ExploreSuggestedProps) {
  const sections = data.filter(
    (section) => section.posts.length > 0 || section.goals.length > 0,
  );

  if (sections.length === 0) {
    return (
      <Typography as="p" variant="muted" className="py-6 text-center text-sm">
        {emptyLabel}
      </Typography>
    );
  }

  return (
    <div className="space-y-7">
      <Typography as="h2" className="border-0 pb-0 text-base font-bold text-foreground">
        {title}
      </Typography>

      {sections.map((section) => (
        <div key={section.category.id} className="space-y-3">
          <div className="flex items-center gap-2">
            {section.category.icon ? (
              <Icon
                icon={section.category.icon}
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : null}
            <Typography
              as="h3"
              className="text-sm font-bold tracking-[-0.01em] text-foreground"
            >
              {section.category.name}
            </Typography>
          </div>

          {section.posts.length > 0 ? (
            <div className="space-y-1.5">
              <Typography
                as="p"
                className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                {postsLabel}
              </Typography>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {section.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/app/posts/${post.id}?from=explore`}
                    aria-label={post.title}
                    className="min-w-[150px] max-w-[150px] shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="h-[88px] justify-end gap-0 rounded-2xl border-0 bg-secondary py-0 text-secondary-foreground shadow-none ring-0 transition-transform hover:-translate-y-0.5">
                      <CardContent className="px-3 py-3">
                        <Typography
                          as="p"
                          variant="small"
                          className="line-clamp-2 text-xs font-bold"
                        >
                          {post.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {section.goals.length > 0 ? (
            <div className="space-y-1.5">
              <Typography
                as="p"
                className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                {goalsLabel}
              </Typography>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {section.goals.map((goal) => (
                  <Link
                    key={goal.id}
                    href={`/app/goals/${goal.id}?from=explore`}
                    aria-label={goal.title}
                    className="min-w-[170px] max-w-[170px] shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="h-[88px] justify-between gap-0 rounded-2xl border border-border bg-muted py-0 text-foreground shadow-none ring-0 transition-transform hover:-translate-y-0.5">
                      <CardContent className="flex h-full flex-col justify-between px-3 py-3">
                        <Typography
                          as="p"
                          variant="small"
                          className="line-clamp-2 text-xs font-bold"
                        >
                          {goal.title}
                        </Typography>
                        <Typography as="p" className="text-xs text-muted-foreground">
                          {goal.progress}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
