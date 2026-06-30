"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  useCategoriesQuery,
  useExploreQuery,
  useSuggestedQuery,
} from "@/apis/queries/social/queries";
import {
  type ExploreCategory,
  postToExploreTile,
} from "@/components/page/explore/explore-data";
import { ExploreFilterChips } from "@/components/page/explore/explore-filter-chips";
import { ExploreCreatorsRow } from "@/components/page/explore/explore-creators-row";
import { ExploreMediaGrid } from "@/components/page/explore/explore-media-grid";
import { ExploreSearchField } from "@/components/page/explore/explore-search-field";
import { ExploreSuggested } from "@/components/page/explore/explore-suggested";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function ExplorePage() {
  const t = useTranslations("app.explore");
  const [category, setCategory] = useState<ExploreCategory>("for-you");
  const isForYou = category === "for-you";
  const exploreQuery = useExploreQuery(isForYou ? undefined : { category });
  const categoriesQuery = useCategoriesQuery();
  const suggestedQuery = useSuggestedQuery();

  const filters = useMemo(
    () => [
      { value: "for-you", label: t("filters.forYou") },
      ...(categoriesQuery.data ?? []).map((cat) => ({
        value: cat.slug,
        label: cat.name,
      })),
    ],
    [categoriesQuery.data, t],
  );

  const tiles = useMemo(
    () => (exploreQuery.data ?? []).map(postToExploreTile),
    [exploreQuery.data],
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

      <div className="mt-[18px] px-1">
        <ExploreFilterChips
          value={category}
          options={filters}
          onValueChange={setCategory}
        />
      </div>

      <div className="mt-5 px-1">
        <ExploreCreatorsRow label={t("creators")} />
      </div>

      {isForYou ? (
        <div className="mt-7 px-1">
          {suggestedQuery.isLoading ? (
            <Typography as="p" variant="muted" className="py-6 text-center text-sm">
              {t("loading")}
            </Typography>
          ) : null}
          {!suggestedQuery.isLoading && !suggestedQuery.isError ? (
            <ExploreSuggested
              data={suggestedQuery.data ?? []}
              title={t("suggestedTitle")}
              postsLabel={t("suggestedPosts")}
              goalsLabel={t("suggestedGoals")}
              emptyLabel={t("suggestedEmpty")}
            />
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        {exploreQuery.isLoading ? (
          <Typography as="p" variant="muted" className="py-10 text-center text-sm">
            {t("loading")}
          </Typography>
        ) : null}

        {exploreQuery.isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Typography as="p" variant="muted" className="text-sm">
              {t("loadError")}
            </Typography>
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              onClick={() => void exploreQuery.refetch()}
            >
              {t("retry")}
            </Button>
          </div>
        ) : null}

        {!exploreQuery.isLoading && !exploreQuery.isError && tiles.length === 0 ? (
          <Typography as="p" variant="muted" className="py-10 text-center text-sm">
            {t("empty")}
          </Typography>
        ) : null}

        {!exploreQuery.isLoading && !exploreQuery.isError && tiles.length > 0 ? (
          <ExploreMediaGrid tiles={tiles} />
        ) : null}
      </div>
    </section>
  );
}
