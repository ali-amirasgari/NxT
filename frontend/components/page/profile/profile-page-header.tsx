"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type ProfilePageHeaderProps = {
  title: string;
  backLabel: string;
  action?: React.ReactNode;
};

export function ProfilePageHeader({
  title,
  backLabel,
  action,
}: ProfilePageHeaderProps) {
  return (
    <header className="flex h-20 items-center gap-3">
      <Button
        asChild
        type="button"
        size="icon"
        variant="ghost"
        tone="neutral"
        className="size-9 rounded-full bg-muted hover:bg-accent"
      >
        <Link href="/app/profile" aria-label={backLabel}>
          <Icon
            icon="solar:arrow-left-linear"
            className="size-5 rtl:rotate-180"
            aria-hidden="true"
          />
        </Link>
      </Button>

      <Typography
        as="h1"
        className="flex-1 text-xl font-bold tracking-[-0.02em] text-foreground"
      >
        {title}
      </Typography>

      {action}
    </header>
  );
}
