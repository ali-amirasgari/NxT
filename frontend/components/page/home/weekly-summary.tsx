"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

type WeeklySummaryProps = {
  title: string;
  summary: string;
};

export function WeeklySummary({ title, summary }: WeeklySummaryProps) {
  return (
    <Card className="h-[92px] rounded-[18px] border-border bg-card py-0 shadow-none md:h-auto">
      <CardContent className="px-5 py-5">
        <Typography
          as="h2"
          className="border-0 pb-0 text-[15px] font-bold text-foreground"
        >
          {title}
        </Typography>
        <Typography
          as="p"
          className="mt-2 text-sm text-muted-foreground"
        >
          {summary}
        </Typography>
      </CardContent>
    </Card>
  );
}
