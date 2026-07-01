"use client";

import { useTranslations } from "next-intl";

import { GoalsToTry } from "@/components/page/home/goals-to-try";
import { HomeHeader } from "@/components/page/home/home-header";
import { InspirationSlider } from "@/components/page/home/inspiration-slider";
import { UpcomingEvents } from "@/components/page/home/upcoming-events";
import { WeeklySummary } from "@/components/page/home/weekly-summary";

export default function AppHomePage() {
  const t = useTranslations("app.homeDashboard");

  const quoteSlides = [
    { text: t("quoteOneText"), accent: "bg-primary", icon: "solar:bolt-bold" },
    { text: t("quoteTwoText"), accent: "bg-emerald-500", icon: "solar:medal-star-bold" },
    { text: t("quoteThreeText"), accent: "bg-red-500", icon: "solar:flag-bold" },
  ];

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <HomeHeader notificationsLabel={t("notifications")} />

      <div className="mt-3">
        <UpcomingEvents
          title={t("eventsTitle")}
          attendeesLabel={(count) => t("eventAttendeesLabel", { count })}
        />
      </div>

      <div className="mt-10">
        <InspirationSlider label={t("inspirationLabel")} slides={quoteSlides} />
      </div>

      <div className="mt-10">
        <GoalsToTry
          labels={{
            title: t("goalsToTryTitle"),
            hint: t("goalsToTryHint"),
            empty: t("goalsToTryEmpty"),
            loadError: t("goalsToTryLoadError"),
            retry: t("goalsToTryRetry"),
            add: t("goalsToTryAdd"),
            by: (name) => t("goalsToTryBy", { name }),
          }}
        />
      </div>

      {/* <div className="mt-10 mb-8">
        <WeeklySummary
          title={t("summaryTitle")}
          summary={t("summaryLine")}
        />
      </div> */}
    </section>
  );
}
