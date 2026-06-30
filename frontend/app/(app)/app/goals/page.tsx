"use client";

import { useTranslations } from "next-intl";

import { useGoalsQuery } from "@/apis/queries/goals/queries";
import { GoalCard } from "@/components/global/goal-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export default function GoalsPage() {
  const t = useTranslations("app.goals");
  const goalsQuery = useGoalsQuery();
  const goals = goalsQuery.data ?? [];

  if (goalsQuery.isLoading) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
        <div className="mt-5 grid gap-4 md:mt-2 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[98px] rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (goalsQuery.isError) {
    return (
      <section className="mx-auto flex w-full max-w-[390px] flex-col items-center gap-3 px-1 pt-20 text-center md:max-w-5xl md:px-0">
        <Typography as="p" className="text-sm text-muted-foreground">
          {t("loadError")}
        </Typography>
        <Button
          type="button"
          variant="outline"
          tone="neutral"
          onClick={() => void goalsQuery.refetch()}
        >
          {t("retry")}
        </Button>
      </section>
    );
  }

  if (goals.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
        <Typography as="p" variant="muted" className="py-20 text-center text-sm">
          {t("empty")}
        </Typography>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <div className="mt-5 grid gap-4 md:mt-2 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            href={`/app/goals/${goal.id}`}
            title={goal.title}
            meta={goal.category?.name ?? goal.schedule_label}
            progress={goal.progress}
            progressLabel={t("progress")}
          />
        ))}
      </div>
    </section>
  );
}
