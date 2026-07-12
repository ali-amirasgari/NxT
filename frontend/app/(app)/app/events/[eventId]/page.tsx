"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { useEventQuery, useRsvpEventMutation, useUnrsvpEventMutation } from "@/apis/queries/events/queries";
import { DetailAuthorRow } from "@/components/global/detail-author-row";
import { DetailPageHeader } from "@/components/global/detail-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { EVENT_TAG_ICON } from "@/lib/event-tag-icon";
import { formatEventDate, formatEventTime } from "@/lib/format-event-date";
import { resolveDisplayName, userInitial } from "@/lib/user-display";
import { cn } from "@/lib/utils";

export default function EventDetailPage() {
  const t = useTranslations("app.eventDetails");
  const locale = useLocale();
  const params = useParams<{ eventId: string }>();
  const { data: event, isLoading, isError } = useEventQuery(params.eventId);
  const rsvp = useRsvpEventMutation(params.eventId);
  const unrsvp = useUnrsvpEventMutation(params.eventId);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
        <div className="flex h-[70px] items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-5 pt-1">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-3xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </section>
    );
  }

  if (isError || !event) {
    return (
      <section className="mx-auto flex w-full max-w-[390px] flex-col items-center gap-3 px-1 pt-20 text-center md:max-w-3xl">
        <Typography as="p" className="text-sm text-muted-foreground">
          {t("notFound")}
        </Typography>
        <Button asChild variant="outline" tone="neutral">
          <Link href="/app">{t("back")}</Link>
        </Button>
      </section>
    );
  }

  const isCancelled = event.status === "cancelled";
  const isPending = rsvp.isPending || unrsvp.isPending;
  const onRsvpError = () => toast.error(t("rsvpError"));

  function toggleRsvp() {
    if (!event) return;
    if (event.is_attending) {
      unrsvp.mutate(undefined, { onError: onRsvpError });
    } else {
      rsvp.mutate(undefined, { onError: onRsvpError });
    }
  }

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
      <DetailPageHeader title={t("pageTitle")} backLabel={t("back")} moreLabel={t("more")} />

      <div className="space-y-5 pt-1">
        <DetailAuthorRow
          initial={userInitial(event.host)}
          name={resolveDisplayName(event.host)}
          meta={event.tag_label}
          badge={isCancelled ? t("cancelled") : undefined}
        />

        <div
          className={cn(
            "flex h-[180px] items-end justify-between rounded-3xl p-5",
            !event.cover_image && (event.cover_color || "bg-primary"),
          )}
          style={
            event.cover_image
              ? {
                  backgroundImage: `url(${event.cover_image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!event.cover_image ? (
            <Icon icon={EVENT_TAG_ICON[event.tag]} className="size-12 text-white/90" aria-hidden="true" />
          ) : null}
        </div>

        <div>
          <Typography as="h2" variant="h3" className="border-0 pb-0 text-2xl font-extrabold tracking-[-0.03em]">
            {event.title}
          </Typography>
          {event.description ? (
            <Typography as="p" variant="muted" className="mt-2 text-sm leading-5">
              {event.description}
            </Typography>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="gap-0 rounded-2xl bg-muted py-0 shadow-none ring-0">
            <CardContent className="p-4">
              <Icon icon="solar:calendar-linear" className="size-5 text-primary" aria-hidden="true" />
              <Typography as="p" variant="muted" className="mt-3 text-xs">
                {t("when")}
              </Typography>
              <Typography as="p" variant="small" className="mt-1 text-sm">
                {formatEventDate(event.starts_at, locale)} · {formatEventTime(event.starts_at, locale)}
              </Typography>
            </CardContent>
          </Card>
          <Card className="gap-0 rounded-2xl bg-muted py-0 shadow-none ring-0">
            <CardContent className="p-4">
              <Icon icon="solar:map-point-linear" className="size-5 text-primary" aria-hidden="true" />
              <Typography as="p" variant="muted" className="mt-3 text-xs">
                {t("where")}
              </Typography>
              <Typography as="p" variant="small" className="mt-1 truncate text-sm">
                {event.location || t("online")}
              </Typography>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:users-group-rounded-linear" className="size-4 text-muted-foreground" aria-hidden="true" />
            <Typography as="span" variant="muted" className="text-sm">
              {t("going", { count: event.attendee_count })}
            </Typography>
          </div>
          {event.is_attending ? <Badge variant="secondary">{t("joined")}</Badge> : null}
        </div>

        {!isCancelled ? (
          <Button
            type="button"
            size="lg"
            variant={event.is_attending ? "outline" : "default"}
            tone={event.is_attending ? "neutral" : "primary"}
            disabled={isPending}
            onClick={toggleRsvp}
            className="h-12 w-full rounded-xl"
          >
            <Icon
              icon={event.is_attending ? "solar:close-circle-linear" : "solar:check-circle-bold"}
              className="size-5"
              aria-hidden="true"
            />
            {event.is_attending ? t("cancelRsvp") : t("join")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
