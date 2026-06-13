"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DetailActions } from "@/components/global/detail-actions";
import { DetailAuthorRow } from "@/components/global/detail-author-row";
import { ContentOptionsMenu } from "@/components/global/content-options-menu";
import { DetailPageHeader } from "@/components/global/detail-page-header";
import { getUserIdByName } from "@/components/global/users-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { useContent } from "@/hooks/use-content";

export default function GoalDetailPage() {
  const t = useTranslations("app.details");
  const params = useParams<{ goalId: string }>();
  const searchParams = useSearchParams();
  const { goals } = useContent();
  const goal = goals.find((item) => item.id === params.goalId);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  if (!goal) return null;

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
      <DetailPageHeader
        title={t("goalTitle")}
        backLabel={t("back")}
        moreLabel={t("more")}
        menu={
          <ContentOptionsMenu
            type="goal"
            id={goal.id}
            goal={goal}
            owner={searchParams.get("from") !== "explore"}
            onShare={() => setShareOpen(true)}
          />
        }
      />

      <div className="space-y-5 pt-1">
        <DetailAuthorRow
          initial={goal.authorInitial}
          name={goal.author}
          meta={goal.meta}
          badge={goal.category}
          href={
            searchParams.get("from") === "explore"
              ? `/app/users/${getUserIdByName(goal.author)}?from=explore`
              : undefined
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
                <Typography
                  as="p"
                  variant="muted"
                  className="mt-2 text-sm leading-5"
                >
                  {goal.description}
                </Typography>
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
                    {goal.stake}
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
                    {goal.schedule}
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div>
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
          <Typography as="p" variant="small" className="mt-2 text-sm">
            {goal.likes}
          </Typography>
          <Button
            type="button"
            variant="link"
            tone="neutral"
            className="mt-2 h-auto justify-start p-0 text-sm font-normal text-muted-foreground"
            onClick={() => setCommentsOpen(true)}
          >
            {goal.comments}
          </Button>
        </div>

        <Button asChild size="lg" className="h-12 w-full rounded-xl">
          <Link href={`/app/posts/create?goalId=${goal.id}`}>
            <Icon
              icon="solar:upload-linear"
              className="size-5"
              aria-hidden="true"
            />
            {t("submitProof")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
