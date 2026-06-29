"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { PostForm } from "@/components/page/create/post-form";
import { useContent } from "@/hooks/use-content";

export default function EditPostPage() {
  const t = useTranslations("app.create");
  const params = useParams<{ postId: string }>();
  const { posts } = useContent();
  const post = posts.find((item) => item.id === params.postId);

  if (!post) return null;

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
          stakeReminder: t("stakeReminder"),
          submit: t("submitPost"),
          save: t("savePost"),
          defaultCaption: t("defaultCaption"),
        }}
      />
    </section>
  );
}
