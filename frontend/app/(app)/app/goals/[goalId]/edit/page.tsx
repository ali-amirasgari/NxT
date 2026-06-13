"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { GoalForm } from "@/components/page/create/goal-form";
import { useContent } from "@/hooks/use-content";

export default function EditGoalPage() {
  const t = useTranslations("app.create");
  const params = useParams<{ goalId: string }>();
  const { goals } = useContent();
  const goal = goals.find((item) => item.id === params.goalId);

  if (!goal) return null;

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
      <CreatePageHeader title={t("editGoal")} backLabel={t("back")} />
      <GoalForm
        initialGoal={goal}
        labels={{
          solo: t("solo"),
          group: t("group"),
          teamCover: t("teamCover"),
          soloCover: t("soloCover"),
          coverHelp: t("coverHelp"),
          color: t("color"),
          title: t("goalTitle"),
          titlePlaceholder: t("goalTitlePlaceholder"),
          description: t("description"),
          descriptionPlaceholder: t("descriptionPlaceholder"),
          category: t("category"),
          categorySearch: t("categorySearch"),
          noCategory: t("noCategory"),
          stake: t("stake"),
          users: t("users"),
          usersPlaceholder: t("usersPlaceholder"),
          usersSearch: t("usersSearch"),
          usersSelected: t("usersSelected"),
          noUsers: t("noUsers"),
          proofLater: t("proofLater"),
          save: t("saveGoal"),
          createGroup: t("createGroup"),
          createSolo: t("createSolo"),
        }}
      />
    </section>
  );
}
