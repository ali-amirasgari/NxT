"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";

import {
  useWalletLedgerQuery,
  useWalletsQuery,
} from "@/apis/queries/wallet/queries";
import { CreatePageHeader } from "@/components/page/create/create-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

function points(value?: string) {
  return Math.round(Number(value ?? 0));
}

export default function WalletPage() {
  const t = useTranslations("app.wallet");
  const td = useTranslations("app.details");
  const { data: wallets = [], isLoading } = useWalletsQuery();
  const pointsWallet = wallets.find((wallet) => wallet.kind === "points");
  const { data: ledger = [] } = useWalletLedgerQuery(pointsWallet?.id, { limit: 20 });

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 pb-6 md:max-w-2xl">
      <CreatePageHeader title={t("title")} backLabel={td("back")} />

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-3xl" />
      ) : (
        <Card className="gap-0 rounded-3xl border-0 bg-primary py-0 text-primary-foreground shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Icon icon="solar:wallet-money-bold" className="size-5" aria-hidden="true" />
              <Typography as="p" variant="small" className="text-sm opacity-90">
                {t("points")}
              </Typography>
            </div>
            <Typography as="p" className="mt-3 text-4xl font-extrabold tracking-tight">
              {points(pointsWallet?.available_balance)}
            </Typography>
            <div className="mt-4 flex gap-6 text-sm opacity-90">
              <span>
                {t("available")}: {points(pointsWallet?.available_balance)}
              </span>
              <span>
                {t("held")}: {points(pointsWallet?.held_balance)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        <Typography as="p" variant="small" className="text-sm font-semibold">
          {t("ledger")}
        </Typography>

        {ledger.length === 0 ? (
          <Typography as="p" variant="muted" className="text-xs">
            {t("empty")}
          </Typography>
        ) : (
          ledger.map((entry) => (
            <Card key={entry.id} className="gap-0 rounded-2xl border-border bg-card py-0 shadow-none ring-0">
              <CardContent className="flex items-center justify-between p-3.5">
                <div className="min-w-0">
                  <Typography as="p" variant="small" className="truncate text-sm capitalize">
                    {entry.reason.replaceAll("_", " ")}
                  </Typography>
                  <Typography as="p" variant="muted" className="text-xs">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </Typography>
                </div>
                <Typography as="span" className="text-sm font-bold">
                  {entry.entry_type === "credit" || entry.entry_type === "release"
                    ? "+"
                    : entry.entry_type === "debit" || entry.entry_type === "capture"
                      ? "−"
                      : ""}
                  {points(entry.amount)}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
