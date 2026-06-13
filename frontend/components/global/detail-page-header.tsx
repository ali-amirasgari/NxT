"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type DetailPageHeaderProps = {
  title: string;
  backLabel: string;
  moreLabel: string;
  menu?: React.ReactNode;
};

export function DetailPageHeader({
  title,
  backLabel,
  moreLabel,
  menu,
}: DetailPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-[70px] items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        tone="neutral"
        size="icon"
        className="size-9 rounded-full"
        onClick={() => router.back()}
        aria-label={backLabel}
      >
        <Icon
          icon="solar:arrow-left-linear"
          className="size-5 rtl:rotate-180"
          aria-hidden="true"
        />
      </Button>

      <Typography
        as="h1"
        variant="h4"
        className="flex-1 text-xl font-bold tracking-[-0.02em]"
      >
        {title}
      </Typography>

      {menu ?? (
        <Button
          type="button"
          variant="ghost"
          tone="neutral"
          size="icon"
          className="size-9 rounded-full"
          aria-label={moreLabel}
        >
          <Icon
            icon="solar:menu-dots-bold"
            className="size-5"
            aria-hidden="true"
          />
        </Button>
      )}
    </header>
  );
}
