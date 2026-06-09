"use client";

import { useTranslations } from "next-intl";

import { GoalCard } from "@/components/global/goal-card";
import { useContent } from "@/hooks/use-content";

export default function GoalsPage() {
  const t = useTranslations("app.goals");
  const { goals } = useContent();

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <div className="mt-5 grid gap-4 md:mt-2 md:grid-cols-2 xl:grid-cols-3">
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
