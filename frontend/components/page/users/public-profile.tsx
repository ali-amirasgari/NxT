"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

import type { PublicUser } from "@/components/global/users-data";
import { ProfileMediaGrid } from "@/components/page/profile/profile-media-grid";
import { ProfileStat } from "@/components/page/profile/profile-stat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type PublicProfileProps = {
  user: PublicUser;
  labels: Record<string, string>;
};

export function PublicProfile({ user, labels }: PublicProfileProps) {
  const [activeTab, setActiveTab] = useState<"goals" | "shared">("shared");
  const [following, setFollowing] = useState(false);
  const stats = [
    { value: user.stats.posts, label: labels.posts },
    { value: user.stats.goals, label: labels.goals },
    { value: user.stats.points, label: labels.points },
    { value: user.stats.streak, label: labels.streak },
  ];

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-5xl md:px-0">
      <header className="flex h-[72px] items-center gap-2">
        <Button
          asChild
          size="icon"
          variant="secondary"
          tone="neutral"
          className="size-9 rounded-full"
        >
          <Link href="/app/explore" aria-label={labels.back}>
            <Icon icon="solar:arrow-left-linear" className="size-5 rtl:rotate-180" />
          </Link>
        </Button>
        <Typography as="h1" className="min-w-0 flex-1 truncate text-lg font-bold">
          {user.username}
        </Typography>
        <Button
          asChild
          size="icon"
          variant="outline"
          tone="neutral"
          className="size-9 rounded-full border-border bg-card"
        >
          <Link href={`/app/chats/${user.id}`} aria-label={labels.message}>
            <Icon icon="solar:chat-round-line-linear" className="size-5" />
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
            {user.initial}
          </AvatarFallback>
        </Avatar>

        <div className="ms-[108px] grid grid-cols-4 gap-1 pt-2">
          {stats.map((stat) => (
            <ProfileStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <Typography as="h2" className="border-0 pb-0 text-lg font-bold">
            {user.name}
          </Typography>
          <Typography as="p" className="max-w-[335px] text-[13px] leading-5 text-muted-foreground">
            {user.bio}
          </Typography>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest) => (
            <Badge key={interest} variant="secondary" className="rounded-full">
              {interest}
            </Badge>
          ))}
        </div>
        <Button
          type="button"
          className="h-10 w-full rounded-2xl font-bold"
          variant={following ? "secondary" : "default"}
          tone={following ? "neutral" : "primary"}
          onClick={() => setFollowing((value) => !value)}
        >
          {following ? labels.following : labels.follow}
        </Button>
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
                icon={tab === "goals" ? "solar:target-linear" : "solar:widget-2-linear"}
                className="size-[18px]"
                aria-hidden="true"
              />
              {labels[tab]}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 bg-primary opacity-0",
                  activeTab === tab && "opacity-100",
                )}
              />
            </Button>
          ))}
        </div>
        <ProfileMediaGrid tab={activeTab} readonly />
      </div>
    </section>
  );
}
