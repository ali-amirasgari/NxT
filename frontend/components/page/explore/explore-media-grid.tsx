import { Icon } from "@iconify/react";
import Link from "next/link";

import type { ExploreTile } from "@/components/page/explore/explore-data";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClasses: Record<ExploreTile["tone"], string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  muted: "bg-muted text-foreground",
  card: "bg-card text-card-foreground",
};

const sizeClasses: Record<ExploreTile["size"], string> = {
  large: "col-span-2 row-span-2",
  small: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
};

export function ExploreMediaGrid({ tiles }: { tiles: ExploreTile[] }) {
  return (
    <div className="grid w-full grid-flow-dense grid-cols-4 auto-rows-[82px] gap-2 md:grid-cols-6 md:auto-rows-[112px] md:gap-3">
      {tiles.map((tile) => (
        <Link
          key={tile.id}
          href={tile.href}
          aria-label={tile.label}
          className={cn(
            "min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            sizeClasses[tile.size],
          )}
        >
          <Card
            className={cn(
              "relative size-full gap-0 rounded-md border-0 py-0 shadow-none ring-0 transition-transform hover:-translate-y-0.5",
              toneClasses[tile.tone],
            )}
          >
            <Icon
              icon={
                tile.media === "video"
                  ? "solar:videocamera-record-linear"
                  : "solar:gallery-linear"
              }
              className="absolute end-2 top-2 size-4"
              aria-hidden="true"
            />
            {tile.hasCaption ? (
              <div className="absolute inset-x-2.5 bottom-4 h-7 rounded-[10px] bg-background/20" />
            ) : null}
          </Card>
        </Link>
      ))}
    </div>
  );
}
