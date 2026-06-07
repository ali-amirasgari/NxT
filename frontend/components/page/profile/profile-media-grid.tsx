import { Icon } from "@iconify/react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

const sharedTiles = [
  {
    id: "morning-run",
    label: "Morning run post",
    surface: "bg-primary text-primary-foreground",
    icon: "video",
    caption: true,
  },
  {
    id: "reading-session",
    label: "Reading session post",
    surface: "bg-secondary text-secondary-foreground",
    icon: "image",
  },
  {
    id: "portfolio-progress",
    label: "Portfolio progress post",
    surface: "bg-accent text-accent-foreground",
    icon: "image",
  },
  {
    id: "morning-run",
    label: "Morning run post",
    surface: "bg-muted text-foreground",
    icon: "image",
    caption: true,
  },
  {
    id: "reading-session",
    label: "Reading session post",
    surface: "bg-card text-card-foreground",
    icon: "video",
  },
  {
    id: "portfolio-progress",
    label: "Portfolio progress post",
    surface: "bg-primary text-primary-foreground",
    icon: "image",
  },
] as const;

const goalTiles = [
  {
    id: "fitness",
    surface: "bg-secondary text-secondary-foreground",
    title: "Morning 5K",
    meta: "65%",
  },
  {
    id: "reading",
    surface: "bg-primary text-primary-foreground",
    title: "Read daily",
    meta: "42%",
  },
  {
    id: "focus",
    surface: "bg-muted text-foreground",
    title: "Portfolio",
    meta: "Team",
  },
] as const;

export function ProfileMediaGrid({ tab }: { tab: "goals" | "shared" }) {
  if (tab === "goals") {
    return (
      <div className="grid grid-cols-2 gap-0.5 bg-background md:gap-3">
        {goalTiles.map((tile) => (
          <Link
            key={tile.title}
            href={`/app/goals/${tile.id}`}
            aria-label={`Open ${tile.title} goal`}
            className="rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:rounded-2xl"
          >
            <Card
              className={`h-[110px] justify-end gap-0 rounded-none border-0 py-0 shadow-none ring-0 md:rounded-2xl ${tile.surface}`}
            >
              <CardContent className="px-3 py-3">
                <Typography as="h3" variant="small" className="text-sm">
                  {tile.title}
                </Typography>
                <Typography as="p" className="mt-1 text-xs opacity-70">
                  {tile.meta}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 bg-background md:gap-3">
      {sharedTiles.map((tile, index) => (
        <Link
          key={`${tile.icon}-${index}`}
          href={`/app/posts/${tile.id}`}
          aria-label={`Open ${tile.label}`}
          className="rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:rounded-2xl"
        >
          <Card
            className={`relative h-[110px] rounded-none border-0 py-0 shadow-none ring-0 md:rounded-2xl ${tile.surface}`}
          >
            <Icon
              icon={
                tile.icon === "video"
                  ? "solar:videocamera-record-linear"
                  : "solar:gallery-linear"
              }
              aria-hidden="true"
              className="absolute end-2.5 top-2.5 size-4"
            />
            {"caption" in tile && tile.caption ? (
              <div className="absolute bottom-2.5 start-2.5 h-[22px] w-[90px] rounded-lg bg-background/20" />
            ) : null}
          </Card>
        </Link>
      ))}
    </div>
  );
}
