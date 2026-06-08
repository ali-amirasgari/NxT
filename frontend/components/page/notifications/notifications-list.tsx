"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: "proof-reminder",
    initial: "!",
    icon: "solar:clock-circle-linear",
    titleKey: "proofTitle",
    descriptionKey: "proofDescription",
    timeKey: "proofTime",
    href: "/app/goals/fitness",
  },
  {
    id: "nima-follow",
    initial: "N",
    icon: "solar:user-plus-linear",
    titleKey: "followTitle",
    descriptionKey: "followDescription",
    timeKey: "followTime",
    href: "/app/users/nima-goals",
  },
  {
    id: "comment",
    initial: "M",
    icon: "solar:chat-round-line-linear",
    titleKey: "commentTitle",
    descriptionKey: "commentDescription",
    timeKey: "commentTime",
    href: "/app/posts/morning-run",
  },
  {
    id: "goal-bet",
    initial: "80",
    icon: "solar:bolt-linear",
    titleKey: "betTitle",
    descriptionKey: "betDescription",
    timeKey: "betTime",
    href: "/app/goals/focus",
  },
] as const;

export function NotificationsList({
  labels,
}: {
  labels: Record<string, string>;
}) {
  const [readIds, setReadIds] = useState<string[]>([]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Typography as="p" variant="muted" className="text-xs">
          {labels.recent}
        </Typography>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={() => setReadIds(notifications.map((item) => item.id))}
        >
          {labels.markAll}
        </Button>
      </div>

      {notifications.map((item) => {
        const read = readIds.includes(item.id);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() =>
              setReadIds((current) =>
                current.includes(item.id) ? current : [...current, item.id],
              )
            }
            className={cn(
              "flex items-start gap-3 rounded-2xl border border-border p-3.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              read ? "bg-card" : "bg-primary/5",
            )}
          >
            <Avatar className="size-11 shrink-0 after:hidden">
              <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                {item.initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <Typography as="h2" variant="small" className="flex-1 text-sm">
                  {labels[item.titleKey]}
                </Typography>
                {!read ? (
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                ) : null}
              </div>
              <Typography as="p" variant="muted" className="mt-1 text-xs leading-5">
                {labels[item.descriptionKey]}
              </Typography>
              <span className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Icon icon={item.icon} className="size-3.5" aria-hidden="true" />
                {labels[item.timeKey]}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
