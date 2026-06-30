"use client";

import { useTranslations } from "next-intl";

import { useGoalsQuery } from "@/apis/queries/goals/queries";
import { GoalCard } from "@/components/global/goal-card";
import { HomeHeader } from "@/components/page/home/home-header";
import { WeeklySummary } from "@/components/page/home/weekly-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export default function AppHomePage() {
  const t = useTranslations("app.homeDashboard");
  const goalsQuery = useGoalsQuery({ status: "active" });
  const goals = goalsQuery.data ?? [];

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <HomeHeader notificationsLabel={t("notifications")} />

      <div className="mt-5 md:mt-[14px]">
        <Typography
          as="h2"
          className="border-0 pb-0 text-[1.375rem] font-extrabold tracking-[-0.025em] text-foreground"
        >
          {t("activeGoalsTitle")}
        </Typography>
        <Typography
          as="p"
          className="mt-0.5 max-w-[320px] text-sm leading-[17px] text-muted-foreground"
        >
          {t("activeGoalsHint")}
        </Typography>
      </div>

      <div className="mt-[12px] md:mt-8">
        {goalsQuery.isLoading ? (
          <div className="grid gap-[22px] md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[98px] rounded-2xl" />
            ))}
          </div>
        ) : null}

        {goalsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Typography as="p" variant="muted" className="text-sm">
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
          </div>
        ) : null}

        {!goalsQuery.isLoading && !goalsQuery.isError && goals.length === 0 ? (
          <Typography as="p" variant="muted" className="py-10 text-center text-sm">
            {t("empty")}
          </Typography>
        ) : null}

        {!goalsQuery.isLoading && !goalsQuery.isError && goals.length > 0 ? (
          <div className="grid gap-[22px] md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                href={`/app/goals/${goal.id}`}
                title={goal.title}
                meta={goal.category?.name ?? goal.schedule_label}
                progress={goal.progress}
                progressLabel={t("progressLabel")}
              />
            ))}
          </div>
        ) : null}
      </div>

      <WeeklySummary
        title={t("summaryTitle")}
        summary={t("summaryLine")}
      />
    </section>
  );
}
