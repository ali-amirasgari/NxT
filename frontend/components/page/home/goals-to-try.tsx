"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

import { useDiscoverGoalsQuery } from "@/apis/queries/goals/queries";
import { resolveDisplayName } from "@/lib/user-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

type GoalsToTryLabels = {
  title: string;
  hint: string;
  empty: string;
  loadError: string;
  retry: string;
  add: string;
  by: (name: string) => string;
};

export function GoalsToTry({ labels }: { labels: GoalsToTryLabels }) {
  const goalsQuery = useDiscoverGoalsQuery(6);
  const goals = goalsQuery.data ?? [];

  return (
    <div>
      <Typography
        as="h2"
        className="border-0 pb-0 text-[1.375rem] font-extrabold tracking-[-0.025em] text-foreground"
      >
        {labels.title}
      </Typography>
      <Typography
        as="p"
        className="mt-0.5 max-w-[320px] text-sm leading-[17px] text-muted-foreground"
      >
        {labels.hint}
      </Typography>

      {goalsQuery.isLoading ? (
        <div className="mt-4 flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[168px] min-w-[190px] rounded-2xl" />
          ))}
        </div>
      ) : null}

      {goalsQuery.isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Typography as="p" variant="muted" className="text-sm">
            {labels.loadError}
          </Typography>
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={() => void goalsQuery.refetch()}
          >
            {labels.retry}
          </Button>
        </div>
      ) : null}

      {!goalsQuery.isLoading && !goalsQuery.isError && goals.length === 0 ? (
        <Typography as="p" variant="muted" className="py-8 text-center text-sm">
          {labels.empty}
        </Typography>
      ) : null}

      {!goalsQuery.isLoading && !goalsQuery.isError && goals.length > 0 ? (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              className="min-w-[190px] max-w-[190px] shrink-0 gap-0 rounded-2xl border-border bg-card py-0 shadow-none ring-0"
            >
              <CardContent className="flex h-full flex-col px-3.5 py-3.5">
                <Link
                  href={`/app/goals/${goal.id}?from=home`}
                  className="block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon
                        icon={goal.category?.icon ?? "solar:target-bold"}
                        className="size-5"
                        aria-hidden="true"
                      />
                    </div>
                    {goal.category ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                        {goal.category.name}
                      </span>
                    ) : null}
                  </div>

                  <Typography
                    as="h3"
                    className="mt-3 line-clamp-2 text-[13px] font-bold leading-[17px] text-foreground"
                  >
                    {goal.title}
                  </Typography>
                  <Typography as="p" variant="muted" className="mt-1 truncate text-xs">
                    {labels.by(resolveDisplayName(goal.owner))}
                  </Typography>
                </Link>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  tone="primary"
                  className="mt-3 h-8 w-full rounded-full text-xs font-bold"
                >
                  <Link href={`/app/goals/create?templateId=${goal.id}`}>
                    <Icon icon="solar:add-circle-linear" className="size-4" aria-hidden="true" />
                    {labels.add}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
