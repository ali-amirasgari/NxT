"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HomeHeaderProps = {
  notificationsLabel: string;
};

export function HomeHeader({ notificationsLabel }: HomeHeaderProps) {
  return (
    <header className="flex justify-end pt-5 md:pt-1">
      <div className="flex items-center gap-2.5">
        <Button
          asChild
          variant="outline"
          tone="neutral"
          size="icon"
          className="relative size-10 -translate-y-1 rounded-full border-border bg-card shadow-none hover:bg-accent"
          aria-label={notificationsLabel}
        >
          <Link href="/app/notifications">
            <Icon
              icon="solar:bell-linear"
              className="size-5"
              aria-hidden="true"
            />
            <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-card" />
          </Link>
        </Button>

        <div
          className="relative flex size-12 items-center justify-center rounded-full bg-secondary"
          aria-label="User A"
        >
          <Image
            src="/figma/avatar-a.svg"
            alt=""
            width={36}
            height={36}
            aria-hidden="true"
          />
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-secondary-foreground">
            A
          </span>
        </div>
      </div>
    </header>
  );
}
