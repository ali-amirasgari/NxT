"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { getPublicUser, publicUsers } from "@/components/global/users-data";
import { PublicProfile } from "@/components/page/users/public-profile";

export default function PublicUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const t = useTranslations("app.publicProfile");
  const user = getPublicUser(params.userId) ?? publicUsers[0];

  return (
    <PublicProfile
      user={user}
      labels={{
        back: t("back"),
        message: t("message"),
        follow: t("follow"),
        following: t("following"),
        posts: t("posts"),
        goals: t("goals"),
        points: t("points"),
        streak: t("streak"),
        shared: t("shared"),
      }}
    />
  );
}
