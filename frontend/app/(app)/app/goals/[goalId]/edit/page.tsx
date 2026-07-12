"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useGoalQuery } from "@/apis/queries/goals/queries";
import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { GoalForm } from "@/components/page/create/goal-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export default function EditGoalPage() {
  const t = useTranslations("app.create");
  const params = useParams<{ goalId: string }>();
  const { data: goal, isLoading, isError } = useGoalQuery(params.goalId);

  const labels = {
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
    categoryPlaceholder: t("categoryPlaceholder"),
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
    error: t("error"),
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
        <CreatePageHeader title={t("editGoal")} backLabel={t("back")} />
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

  if (isError || !goal) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
        <CreatePageHeader title={t("editGoal")} backLabel={t("back")} />
        <div className="flex flex-col items-center gap-3 pt-20 text-center">
          <Typography as="p" className="text-sm text-muted-foreground">
            {t("notFound")}
          </Typography>
          <Button asChild variant="outline" tone="neutral">
            <Link href="/app/profile">{t("back")}</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
      <CreatePageHeader title={t("editGoal")} backLabel={t("back")} />
      <GoalForm initialGoal={goal} labels={labels} />
    </section>
  );
}
