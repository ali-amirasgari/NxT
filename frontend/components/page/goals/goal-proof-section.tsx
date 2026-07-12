"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  useGoalProofsQuery,
  useReviewProofMutation,
  useSubmitProofMutation,
} from "@/apis/queries/goals/queries";
import type { GoalProof, GoalStatus, ProofVote } from "@/apis/types/goal";
import { resolveDisplayName, userInitial } from "@/lib/user-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";

function StatusBadge({ status, labels }: { status: GoalProof["status"]; labels: Record<string, string> }) {
  return <Badge variant="secondary">{labels[status]}</Badge>;
}

export function GoalProofSection({
  goalId,
  goalStatus,
  meId,
}: {
  goalId: number;
  goalStatus: GoalStatus;
  meId?: number;
}) {
  const t = useTranslations("app.proof");
  const { data: proofs = [] } = useGoalProofsQuery(goalId);
  const submit = useSubmitProofMutation(goalId);
  const review = useReviewProofMutation(goalId);

  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");

  const myProof = meId ? proofs.find((proof) => proof.author.id === meId) : undefined;
  const otherProofs = proofs.filter((proof) => proof.author.id !== meId);

  const statusLabels = {
    pending: t("pending"),
    approved: t("approved"),
    rejected: t("rejected"),
  };

  function handleSubmit() {
    if (!file) return;
    submit.mutate(
      { media: file, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setFile(null);
          setNote("");
        },
        onError: () => toast.error(t("error")),
      },
    );
  }

  function handleVote(proof: GoalProof, vote: ProofVote) {
    review.mutate(
      { proofId: proof.id, vote },
      { onError: () => toast.error(t("error")) },
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Typography as="h3" variant="h3" className="border-0 pb-0 text-lg font-bold">
          {t("title")}
        </Typography>
        <Typography as="p" variant="muted" className="text-xs">
          {t("description")}
        </Typography>
      </div>

      {goalStatus === "completed" ? (
        <Card className="gap-0 rounded-2xl bg-primary/10 py-0 shadow-none ring-primary/20">
          <CardContent className="flex items-center gap-2 p-4">
            <Icon icon="solar:verified-check-bold" className="size-5 text-primary" aria-hidden="true" />
            <Typography as="p" variant="small" className="text-sm">
              {t("settled")}
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {/* Your proof */}
      <Card className="gap-0 rounded-2xl border-border bg-card py-0 shadow-none ring-0">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <Typography as="p" variant="small" className="text-sm font-semibold">
              {t("yourProof")}
            </Typography>
            {myProof ? <StatusBadge status={myProof.status} labels={statusLabels} /> : null}
          </div>

          {myProof?.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={myProof.media_url}
              alt={t("yourProof")}
              className="max-h-56 w-full rounded-xl object-cover"
            />
          ) : null}

          {goalStatus !== "completed" ? (
            <>
              <Label
                htmlFor="proof-file"
                className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-4 text-center"
              >
                <Icon icon="solar:camera-add-bold" className="size-6 text-primary" aria-hidden="true" />
                <Typography as="span" variant="small" className="mt-2 text-sm">
                  {file ? file.name : t("choosePhoto")}
                </Typography>
                <input
                  id="proof-file"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </Label>

              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("notePlaceholder")}
                className="min-h-16 rounded-xl bg-muted px-3.5"
              />

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!file || submit.isPending}
                className="h-11 w-full rounded-xl font-bold"
              >
                <Icon icon="solar:upload-linear" className="size-5" aria-hidden="true" />
                {myProof ? t("resubmit") : t("submit")}
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Team proofs to review */}
      <div className="space-y-2">
        <Typography as="p" variant="small" className="text-sm font-semibold">
          {t("teamProofs")}
        </Typography>

        {otherProofs.length === 0 ? (
          <Typography as="p" variant="muted" className="text-xs">
            {t("empty")}
          </Typography>
        ) : (
          otherProofs.map((proof) => (
            <Card key={proof.id} className="gap-0 rounded-2xl border-border bg-card py-0 shadow-none ring-0">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {userInitial(proof.author)}
                    </span>
                    <Typography as="span" className="text-sm font-semibold">
                      {resolveDisplayName(proof.author)}
                    </Typography>
                  </div>
                  <StatusBadge status={proof.status} labels={statusLabels} />
                </div>

                {proof.media_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proof.media_url}
                    alt={resolveDisplayName(proof.author)}
                    className="max-h-56 w-full rounded-xl object-cover"
                  />
                ) : null}

                {proof.note ? (
                  <Typography as="p" variant="muted" className="text-xs">
                    {proof.note}
                  </Typography>
                ) : null}

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{proof.approvals} {t("approveCount")}</span>
                  <span>{proof.rejections} {t("rejectCount")}</span>
                </div>

                {proof.status === "pending" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      tone="neutral"
                      onClick={() => handleVote(proof, "reject")}
                      disabled={review.isPending}
                      className="h-10 rounded-xl"
                    >
                      <Icon icon="solar:close-circle-linear" className="size-4" aria-hidden="true" />
                      {t("reject")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleVote(proof, "approve")}
                      disabled={review.isPending}
                      className="h-10 rounded-xl"
                    >
                      <Icon icon="solar:check-circle-linear" className="size-4" aria-hidden="true" />
                      {t("approve")}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
