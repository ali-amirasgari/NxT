"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type HomeHeaderProps = {
  title: string;
  notificationsLabel: string;
};

export function HomeHeader({ title, notificationsLabel }: HomeHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 pt-5 md:items-center md:pt-1">
      <Typography
        as="h1"
        className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-foreground"
      >
        {title}
      </Typography>

      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          tone="neutral"
          size="icon"
          className="relative size-10 -translate-y-1 rounded-full border-border bg-card shadow-none hover:bg-accent"
          aria-label={notificationsLabel}
        >
          <Icon
            icon="solar:bell-linear"
            className="size-5"
            aria-hidden="true"
          />
          <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-card" />
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
