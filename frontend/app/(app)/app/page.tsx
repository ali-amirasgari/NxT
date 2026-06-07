"use client";

import { useTranslations } from "next-intl";

import { GoalCard } from "@/components/global/goal-card";
import { HomeHeader } from "@/components/page/home/home-header";
import { WeeklySummary } from "@/components/page/home/weekly-summary";
import { Typography } from "@/components/ui/typography";

const goals = [
  { id: "fitness", titleKey: "goalOneTitle", metaKey: "goalOneMeta" },
  { id: "reading", titleKey: "goalTwoTitle", metaKey: "goalTwoMeta" },
  { id: "focus", titleKey: "goalThreeTitle", metaKey: "goalThreeMeta" },
] as const;

export default function AppHomePage() {
  const t = useTranslations("app.homeDashboard");

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <HomeHeader
        title={t("headerTitle")}
        notificationsLabel={t("notifications")}
      />

      <div className="mt-[14px]">
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

      <div className="mt-[12px] grid gap-[22px] md:mt-8 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            href={`/app/goals/${goal.id}`}
            title={t(goal.titleKey)}
            meta={t(goal.metaKey)}
            progress={64}
            progressLabel={t("progressLabel")}
          />
        ))}
      </div>

      <WeeklySummary
        title={t("summaryTitle")}
        summary={t("summaryLine")}
      />
    </section>
  );
}
