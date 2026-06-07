"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";

type GoalCardProps = {
  href: string;
  title: string;
  meta: string;
  progress: number;
  progressLabel: string;
};

export function GoalCard({
  href,
  title,
  meta,
  progress,
  progressLabel,
}: GoalCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card
        size="sm"
        className="h-[98px] rounded-2xl border-border bg-card !py-0 shadow-none transition-colors hover:bg-accent md:h-auto"
      >
        <CardContent className="px-4 py-[18px]">
          <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Icon
              icon="solar:target-bold"
              className="size-5"
              aria-hidden="true"
            />
          </div>

            <div className="min-w-0 w-[250px]">
            <Typography
              as="h3"
              className="text-[15px] font-bold tracking-[-0.01em] text-foreground"
            >
              {title}
            </Typography>
            <Typography
              as="p"
              className="mt-0.5 text-xs text-muted-foreground"
            >
              {meta}
            </Typography>
            <Progress
              value={progress}
              aria-label={`${title} ${progressLabel}`}
              className="mt-[10px] h-1.5 rounded-full bg-muted"
            />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
