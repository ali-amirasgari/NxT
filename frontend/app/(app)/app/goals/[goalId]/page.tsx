"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import {
  useAcceptGoalMutation,
  useDeclineGoalMutation,
  useGoalQuery,
  useUpdateGoalMutation,
} from "@/apis/queries/goals/queries";
import { useMeQuery } from "@/apis/queries/users/queries";
import { resolveDisplayName, userInitial } from "@/lib/user-display";
import { GoalProofSection } from "@/components/page/goals/goal-proof-section";
import { DetailActions } from "@/components/global/detail-actions";
import { DetailAuthorRow } from "@/components/global/detail-author-row";
import { ContentOptionsMenu } from "@/components/global/content-options-menu";
import { DetailPageHeader } from "@/components/global/detail-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export default function GoalDetailPage() {
  const t = useTranslations("app.details");
  const tp = useTranslations("app.proof");
  const params = useParams<{ goalId: string }>();
  const searchParams = useSearchParams();
  const { data: goal, isLoading, isError } = useGoalQuery(params.goalId);
  const { data: me } = useMeQuery();
  const updateGoal = useUpdateGoalMutation(params.goalId);
  const acceptGoal = useAcceptGoalMutation(params.goalId);
  const declineGoal = useDeclineGoalMutation(params.goalId);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const fromExplore = searchParams.get("from") === "explore";

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

  if (isError || !goal) {
    return (
      <section className="mx-auto flex w-full max-w-[390px] flex-col items-center gap-3 px-1 pt-20 text-center md:max-w-3xl">
        <Typography as="p" className="text-sm text-muted-foreground">
          {t("notFound")}
        </Typography>
        <Button asChild variant="outline" tone="neutral">
          <Link href="/app/explore">{t("back")}</Link>
        </Button>
      </section>
    );
  }

  const isOwner = me ? goal.owner.id === me.id : !fromExplore;
  const ownerName = resolveDisplayName(goal.owner);
  const scheduleLabel =
    goal.schedule_label || goal.category?.name || "—";
  const myMembership = me
    ? goal.members.find((member) => member.user_id === me.id)
    : undefined;
  const isInvited = myMembership?.status === "invited";
  const isAcceptedMember = myMembership?.status === "accepted";

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
      <DetailPageHeader
        title={t("goalTitle")}
        backLabel={t("back")}
        moreLabel={t("more")}
        menu={
          <ContentOptionsMenu
            type="goal"
            id={String(goal.id)}
            goal={goal}
            owner={isOwner}
            onShare={() => setShareOpen(true)}
          />
        }
      />

      <div className="space-y-5 pt-1">
        <DetailAuthorRow
          initial={userInitial(goal.owner)}
          name={ownerName}
          meta={goal.goal_type === "group" ? t("groupGoal") : t("soloGoal")}
          badge={goal.category?.name}
          href={
            fromExplore ? `/app/users/${goal.owner.id}?from=explore` : undefined
          }
        />

        <Card className="gap-0 rounded-3xl border-border bg-card py-0 shadow-none ring-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Typography
                  as="h2"
                  variant="h3"
                  className="border-0 pb-0 text-2xl font-extrabold tracking-[-0.03em]"
                >
                  {goal.title}
                </Typography>
                {goal.description ? (
                  <Typography
                    as="p"
                    variant="muted"
                    className="mt-2 text-sm leading-5"
                  >
                    {goal.description}
                  </Typography>
                ) : null}
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Icon
                  icon="solar:target-bold"
                  className="size-6"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Typography as="p" variant="small" className="text-sm">
                {t("progress")}
              </Typography>
              <Badge variant="secondary">{goal.progress}%</Badge>
            </div>
            <Progress value={goal.progress} className="mt-3 h-2" />

            <Separator className="my-5" />

            <div className="grid grid-cols-2 gap-3">
              <Card className="gap-0 rounded-2xl bg-muted py-0 shadow-none ring-0">
                <CardContent className="p-4">
                  <Icon
                    icon="solar:bolt-linear"
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <Typography
                    as="p"
                    variant="muted"
                    className="mt-3 text-xs"
                  >
                    {t("stake")}
                  </Typography>
                  <Typography as="p" variant="large" className="mt-1">
                    {t("points", { count: goal.stake_points })}
                  </Typography>
                </CardContent>
              </Card>
              <Card className="gap-0 rounded-2xl bg-muted py-0 shadow-none ring-0">
                <CardContent className="p-4">
                  <Icon
                    icon="solar:calendar-linear"
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <Typography
                    as="p"
                    variant="muted"
                    className="mt-3 text-xs"
                  >
                    {t("schedule")}
                  </Typography>
                  <Typography as="p" variant="small" className="mt-1 text-sm">
                    {scheduleLabel}
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <DetailActions
          likeLabel={t("like")}
          commentLabel={t("comment")}
          shareLabel={t("share")}
          commentsOpen={commentsOpen}
          onCommentsOpenChange={setCommentsOpen}
          shareOpen={shareOpen}
          onShareOpenChange={setShareOpen}
          shareUrl={`/app/goals/${goal.id}`}
        />

        {goal.goal_type === "group" ? (
          isInvited ? (
            <Card className="gap-0 rounded-3xl border-border bg-card py-0 shadow-none ring-0">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:users-group-rounded-linear"
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <Typography as="p" variant="small" className="text-sm font-semibold">
                    {tp("invitePending")}
                  </Typography>
                </div>
                <Typography as="p" variant="muted" className="text-xs">
                  {tp("inviteHint")}
                </Typography>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    tone="neutral"
                    disabled={declineGoal.isPending}
                    onClick={() =>
                      declineGoal.mutate(undefined, {
                        onError: () => toast.error(tp("error")),
                      })
                    }
                    className="h-11 rounded-xl"
                  >
                    {tp("decline")}
                  </Button>
                  <Button
                    type="button"
                    disabled={acceptGoal.isPending}
                    onClick={() =>
                      acceptGoal.mutate(undefined, {
                        onError: () => toast.error(tp("error")),
                      })
                    }
                    className="h-11 rounded-xl font-bold"
                  >
                    {tp("accept")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isAcceptedMember ? (
            <GoalProofSection
              goalId={goal.id}
              goalStatus={goal.status}
              meId={me?.id}
            />
          ) : null
        ) : isOwner && goal.status === "active" ? (
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-xl"
            disabled={updateGoal.isPending}
            onClick={() =>
              updateGoal.mutate(
                { status: "completed" },
                { onError: () => toast.error(tp("error")) },
              )
            }
          >
            <Icon
              icon="solar:check-circle-linear"
              className="size-5"
              aria-hidden="true"
            />
            {tp("markDone")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
