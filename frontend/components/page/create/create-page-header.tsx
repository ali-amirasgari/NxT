"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export function CreatePageHeader({
  title,
  backLabel,
}: {
  title: string;
  backLabel: string;
}) {
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
      <Typography as="h1" variant="h4" className="text-xl font-bold">
        {title}
      </Typography>
    </header>
  );
}
