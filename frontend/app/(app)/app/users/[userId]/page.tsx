"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useUserQuery } from "@/apis/queries/users/queries";
import { PublicProfile } from "@/components/page/users/public-profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export default function PublicUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const t = useTranslations("app.publicProfile");
  const { data: user, isLoading, isError } = useUserQuery(params.userId);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
        <div className="flex h-[72px] items-center gap-2">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-[80px] rounded-[18px]" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="mt-3 h-10 w-full rounded-2xl" />
        </div>
      </section>
    );
  }

  if (isError || !user) {
    return (
      <section className="mx-auto flex w-full max-w-[390px] flex-col items-center gap-3 px-1 pt-20 text-center md:max-w-5xl">
        <Typography as="p" className="text-sm text-muted-foreground">
          {t("notFound")}
        </Typography>
        <Button asChild variant="outline" tone="neutral">
          <Link href="/app/explore">{t("back")}</Link>
        </Button>
      </section>
    );
  }

  return (
    <PublicProfile
      user={user}
      labels={{
        back: t("back"),
        message: t("message"),
        follow: t("follow"),
        following: t("following"),
        followers: t("followers"),
        followingCount: t("followingCount"),
        goals: t("goals"),
        shared: t("shared"),
      }}
    />
  );
}
