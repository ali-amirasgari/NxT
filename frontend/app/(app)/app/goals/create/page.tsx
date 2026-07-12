"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useGoalQuery } from "@/apis/queries/goals/queries";
import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { GoalForm } from "@/components/page/create/goal-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateGoalPage() {
  const t = useTranslations("app.create");
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? undefined;
  const templateQuery = useGoalQuery(templateId);

  if (templateId && templateQuery.isLoading) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
        <CreatePageHeader title={t("createGoal")} backLabel={t("back")} />
        <div className="space-y-5 pt-1">
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-[106px] w-full rounded-[18px]" />
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-[72px] w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-[14px]" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
      <CreatePageHeader title={t("createGoal")} backLabel={t("back")} />
      <GoalForm
        templateGoal={templateQuery.data}
        labels={{
          solo: t("solo"),
          group: t("group"),
          teamCover: t("teamCover"),
          soloCover: t("soloCover"),
          coverHelp: t("coverHelp"),
          color: t("color"),
          coverImage: t("coverImage"),
          coverImageHint: t("coverImageHint"),
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
