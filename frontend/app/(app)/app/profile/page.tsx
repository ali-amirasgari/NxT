"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { ProfileMediaGrid } from "@/components/page/profile/profile-media-grid";
import { ProfileStat } from "@/components/page/profile/profile-stat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  getProfileServerSnapshot,
  getProfileSnapshot,
  parseProfile,
  subscribeToProfile,
} from "@/lib/profile-storage";

const stats = [
  { value: "18", labelKey: "posts" },
  { value: "3", labelKey: "goals" },
  { value: "1.2k", labelKey: "points" },
  { value: "12", labelKey: "streak" },
] as const;

export default function ProfilePage() {
  const t = useTranslations("app.profile");
  const [activeTab, setActiveTab] = useState<"goals" | "shared">("shared");
  const profileSnapshot = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getProfileServerSnapshot,
  );
  const profile = useMemo(() => parseProfile(profileSnapshot), [profileSnapshot]);

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <header className="flex h-[72px] items-center gap-2">
        <Typography
          as="h1"
          className="min-w-0 flex-1 truncate text-lg font-bold text-foreground"
        >
          {profile.username}
        </Typography>

        <Button
          asChild
          size="icon"
          variant="outline"
          tone="neutral"
          className="size-9 rounded-full border-border bg-card hover:bg-accent"
        >
          <Link href="/app/profile/settings" aria-label={t("openSettings")}>
            <Icon
              icon="solar:settings-linear"
              className="size-5"
              aria-hidden="true"
            />
          </Link>
        </Button>

        <Button
          asChild
          size="icon"
          variant="outline"
          tone="neutral"
          className="size-9 rounded-full border-border bg-card hover:bg-accent"
        >
          <Link href="/app/profile/edit" aria-label={t("editProfile")}>
            <Icon
              icon="solar:pen-new-square-linear"
              className="size-5"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </header>

      <div className="relative">
        <Card className="h-[80px] gap-0 rounded-[18px] border border-border bg-secondary py-0 shadow-none ring-0">
          <CardContent className="flex h-full items-center gap-4 px-4">
            <span className="h-[46px] w-[92px] rounded-xl bg-primary/30" />
            <span className="h-[46px] w-[92px] rounded-xl bg-secondary-foreground/10" />
            <span className="h-[46px] flex-1 rounded-xl bg-muted/40" />
          </CardContent>
        </Card>

        <Avatar className="absolute start-1.5 top-9 size-[84px] border-4 border-background after:hidden">
          <AvatarFallback className="bg-primary text-[22px] font-bold text-primary-foreground">
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="ms-[108px] grid grid-cols-4 gap-1 pt-2">
          {stats.map((stat) => (
            <ProfileStat
              key={stat.labelKey}
              value={stat.value}
              label={t(stat.labelKey)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <Typography
          as="h2"
          className="border-0 pb-0 text-lg font-bold text-foreground"
        >
          {profile.name}
        </Typography>
        <Typography
          as="p"
          className="max-w-[335px] text-[13px] leading-5 text-muted-foreground"
        >
          {profile.bio}
        </Typography>
      </div>

      <div className="-mx-5 mt-5 border-t border-border md:mx-0 md:mt-8">
        <div className="grid h-16 grid-cols-2">
          {(["goals", "shared"] as const).map((tab) => (
            <Button
              key={tab}
              type="button"
              variant="ghost"
              tone={activeTab === tab ? "primary" : "neutral"}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative h-full rounded-none flex-col gap-1 text-[10px] font-bold",
                activeTab !== tab && "text-muted-foreground",
              )}
            >
              <Icon
                icon={
                  tab === "goals"
                    ? "solar:target-linear"
                    : "solar:widget-2-linear"
                }
                className="size-[18px]"
                aria-hidden="true"
              />
              {t(tab)}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 bg-primary opacity-0",
                  activeTab === tab && "opacity-100",
                )}
              />
            </Button>
          ))}
        </div>

        <ProfileMediaGrid tab={activeTab} />
      </div>
    </section>
  );
}
