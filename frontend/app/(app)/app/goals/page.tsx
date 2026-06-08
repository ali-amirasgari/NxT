"use client";

import { useTranslations } from "next-intl";

import { GoalCard } from "@/components/global/goal-card";
import { Typography } from "@/components/ui/typography";
import { useContent } from "@/hooks/use-content";

export default function GoalsPage() {
  const t = useTranslations("app.goals");
  const { goals } = useContent();

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <div className="space-y-1 pt-5 md:pt-1">
        <Typography
          as="h1"
          variant="h2"
          className="border-0 pb-0 text-[1.75rem] font-extrabold tracking-[-0.03em]"
        >
          {t("title")}
        </Typography>
        <Typography as="p" variant="muted" className="max-w-sm text-sm">
          {t("description")}
        </Typography>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            href={`/app/goals/${goal.id}`}
            title={goal.title}
            meta={goal.meta}
            progress={goal.progress}
            progressLabel={t("progress")}
          />
        ))}
      </div>
    </section>
  );
}
