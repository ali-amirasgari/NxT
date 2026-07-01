"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useDiscoverGoalsQuery } from "@/apis/queries/goals/queries";
import { useExploreQuery } from "@/apis/queries/social/queries";
import { combineExploreTiles } from "@/components/page/explore/explore-data";
import { ExploreMediaGrid } from "@/components/page/explore/explore-media-grid";
import { ExploreSearchField } from "@/components/page/explore/explore-search-field";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function ExplorePage() {
  const t = useTranslations("app.explore");
  const exploreQuery = useExploreQuery();
  const goalsQuery = useDiscoverGoalsQuery(12);

  const isLoading = exploreQuery.isLoading || goalsQuery.isLoading;
  const isError = exploreQuery.isError || goalsQuery.isError;

  const tiles = useMemo(
    () => combineExploreTiles(exploreQuery.data ?? [], goalsQuery.data ?? []),
    [exploreQuery.data, goalsQuery.data],
  );

  return (
    <section className="mx-auto w-full px-0 md:max-w-5xl">
      <div className="mt-5 px-1 md:mt-2">
        <ExploreSearchField
          compactLink
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      <div className="mt-5">
        {isLoading ? (
          <Typography as="p" variant="muted" className="py-10 text-center text-sm">
            {t("loading")}
          </Typography>
        ) : null}

        {isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Typography as="p" variant="muted" className="text-sm">
              {t("loadError")}
            </Typography>
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              onClick={() => {
                void exploreQuery.refetch();
                void goalsQuery.refetch();
              }}
            >
              {t("retry")}
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && tiles.length === 0 ? (
          <Typography as="p" variant="muted" className="py-10 text-center text-sm">
            {t("empty")}
          </Typography>
        ) : null}

        {!isLoading && !isError && tiles.length > 0 ? (
          <ExploreMediaGrid tiles={tiles} />
        ) : null}
      </div>
    </section>
  );
}
