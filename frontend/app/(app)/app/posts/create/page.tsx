"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { PostForm } from "@/components/page/create/post-form";
import { useContent } from "@/hooks/use-content";

export default function CreatePostPage() {
  const t = useTranslations("app.create");
  const searchParams = useSearchParams();
  const { goals } = useContent();
  const goal = goals.find((item) => item.id === searchParams.get("goalId"));

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
      <CreatePageHeader title={t("createPost")} backLabel={t("back")} />
      <PostForm
        goalTitle={goal?.title}
        labels={{
          title: t("postTitle"),
          titlePlaceholder: t("postTitlePlaceholder"),
          upload: t("upload"),
          uploadHint: t("uploadHint"),
          note: t("note"),
          notePlaceholder: t("notePlaceholder"),
          validator: t("validator"),
          validatorHint: t("validatorHint"),
          stakeReminder: t("stakeReminder"),
          submit: t("submitPost"),
          save: t("savePost"),
          defaultCaption: t("defaultCaption"),
        }}
      />
    </section>
  );
}
