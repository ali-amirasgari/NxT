"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useGoalQuery } from "@/apis/queries/goals/queries";
import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { PostForm } from "@/components/page/create/post-form";

export default function CreatePostPage() {
  const t = useTranslations("app.create");
  const searchParams = useSearchParams();
  const goalParam = searchParams.get("goalId");
  const goalId = goalParam ? Number.parseInt(goalParam, 10) : undefined;
  const { data: goal } = useGoalQuery(goalId);

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
      <CreatePageHeader title={t("createPost")} backLabel={t("back")} />
      <PostForm
        goalId={goalId && !Number.isNaN(goalId) ? goalId : undefined}
        goalTitle={goal?.title}
        labels={{
          title: t("postTitle"),
          titlePlaceholder: t("postTitlePlaceholder"),
          upload: t("upload"),
          uploadHint: t("uploadHint"),
          note: t("note"),
          notePlaceholder: t("notePlaceholder"),
          category: t("category"),
          categoryPlaceholder: t("categoryPlaceholder"),
          categorySearch: t("categorySearch"),
          noCategory: t("noCategory"),
          stakeReminder: t("stakeReminder"),
          submit: t("submitPost"),
          save: t("savePost"),
          error: t("error"),
        }}
      />
    </section>
  );
}
