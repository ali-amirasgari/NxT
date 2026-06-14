"use client";

import { useTranslations } from "next-intl";

import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { NotificationsList } from "@/components/page/notifications/notifications-list";
import { Typography } from "@/components/ui/typography";

export default function NotificationsPage() {
  const t = useTranslations("app.notifications");

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 pb-6 md:max-w-3xl">
      <CreatePageHeader title={t("title")} backLabel={t("back")} />
      <Typography as="p" variant="muted" className="-mt-2 mb-5 text-sm">
        {t("description")}
      </Typography>
      <NotificationsList
        labels={{
          recent: t("recent"),
          markAll: t("markAll"),
          loading: t("loading"),
          empty: t("empty"),
        }}
      />
    </section>
  );
}
