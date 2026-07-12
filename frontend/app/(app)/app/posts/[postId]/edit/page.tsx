"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { usePostQuery } from "@/apis/queries/social/queries";
import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { PostForm } from "@/components/page/create/post-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export default function EditPostPage() {
  const t = useTranslations("app.create");
  const params = useParams<{ postId: string }>();
  const { data: post, isLoading, isError } = usePostQuery(params.postId);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
        <CreatePageHeader title={t("editPost")} backLabel={t("back")} />
        <div className="space-y-5 pt-1">
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-[170px] w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </section>
    );
  }

  if (isError || !post) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 pb-6">
        <CreatePageHeader title={t("editPost")} backLabel={t("back")} />
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
      <CreatePageHeader title={t("editPost")} backLabel={t("back")} />
      <PostForm
        initialPost={post}
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
          requireMedia: t("requireMedia"),
          submit: t("submitPost"),
          save: t("savePost"),
          error: t("error"),
        }}
      />
    </section>
  );
}
