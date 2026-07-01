"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useLocale } from "next-intl";

import { useEventsQuery } from "@/apis/queries/events/queries";
import { EVENT_TAG_ICON } from "@/lib/event-tag-icon";
import { formatEventDate, formatEventTime } from "@/lib/format-event-date";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type UpcomingEventsProps = {
  title: string;
  attendeesLabel: (count: number) => string;
};

export function UpcomingEvents({ title, attendeesLabel }: UpcomingEventsProps) {
  const locale = useLocale();
  const eventsQuery = useEventsQuery({ upcoming: true });
  const events = eventsQuery.data ?? [];

  if (!eventsQuery.isLoading && events.length === 0) {
    return null;
  }

  return (
    <div>
      <Typography
        as="h2"
        className="border-0 pb-0 text-[1.375rem] font-extrabold tracking-[-0.025em] text-foreground"
      >
        {title}
      </Typography>

      {eventsQuery.isLoading ? (
        <div className="mt-4 flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[190px] min-w-[220px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/app/events/${event.id}`}
              className="min-w-[220px] max-w-[220px] shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full gap-0 rounded-2xl border-border bg-card py-0 shadow-none ring-0">
                <div
                  className={cn(
                    "flex h-[92px] items-end justify-between p-3",
                    !event.cover_image && (event.cover_color || "bg-primary"),
                  )}
                  style={{
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                    ...(event.cover_image
                      ? {
                          backgroundImage: `url(${event.cover_image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : null),
                  }}
                >
                  <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-bold text-white">
                    {event.tag_label}
                  </span>
                  {!event.cover_image ? (
                    <Icon
                      icon={EVENT_TAG_ICON[event.tag]}
                      className="size-8 text-white/90"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <CardContent className="px-3.5 py-3">
                  <Typography
                    as="h3"
                    className="line-clamp-2 text-sm font-bold tracking-[-0.01em] text-foreground"
                  >
                    {event.title}
                  </Typography>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Icon
                        icon="solar:calendar-linear"
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      />
                      <Typography as="span" className="text-xs font-bold text-primary">
                        {formatEventDate(event.starts_at, locale)}
                      </Typography>
                      <Typography as="span" variant="muted" className="text-xs">
                        · {formatEventTime(event.starts_at, locale)}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon
                        icon="solar:users-group-rounded-linear"
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Typography as="span" variant="muted" className="text-xs">
                        {attendeesLabel(event.attendee_count)}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
